import { google } from "googleapis";
import { db } from "@/db";
import { googleCredentials } from "@/db/schema/system/googleCredentials";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export class GoogleIntegrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleIntegrationError";
  }
}

/**
 * Helper to generate a deterministic UUID (UUID v5 concept using SHA-256)
 * to establish stable identity across retries.
 */
export function generateDeterministicUuid(key: string): string {
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32),
  ].join("-");
}

/**
 * Constructs a fresh Google OAuth2 client.
 */
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/integrations/google/callback";

  if (!clientId || !clientSecret) {
    throw new GoogleIntegrationError(
      "Google OAuth client credentials are not configured on the server."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates the Google OAuth authorization URL.
 * Uses least privilege scopes: calendar.events instead of full calendar.
 */
export function getAuthorizationUrl(state: string) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    state,
  });
}

/**
 * Exchanges the code for OAuth tokens and retrieves the account email.
 * Enforces authorized email exactly matches GOOGLE_CALENDAR_ACCOUNT, case-insensitively.
 */
export async function exchangeCode(code: string) {
  const oauth2Client = getOAuth2Client();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      throw new GoogleIntegrationError("Could not retrieve user email from Google.");
    }

    const expectedAccount = process.env.GOOGLE_CALENDAR_ACCOUNT || "psysphereclasses@gmail.com";
    if (email.toLowerCase() !== expectedAccount.toLowerCase()) {
      throw new GoogleIntegrationError(
        `Unauthorized Google Account: This PsySphere installation is strictly locked to "${expectedAccount}". Access denied for "${email}".`
      );
    }

    if (!tokens.refresh_token) {
      // Check if we already have a refresh token stored for this email
      const [existing] = await db
        .select()
        .from(googleCredentials)
        .where(eq(googleCredentials.accountEmail, email.toLowerCase()))
        .limit(1);

      if (existing?.refreshToken) {
        tokens.refresh_token = existing.refreshToken;
      } else {
        throw new GoogleIntegrationError(
          "No refresh token returned by Google. If already connected, please disconnect/revoke access and try again."
        );
      }
    }

    return {
      email: email.toLowerCase(),
      tokens,
    };
  } catch (error: any) {
    throw new GoogleIntegrationError(error.message || "Failed to exchange Google authorization code.");
  }
}

/**
 * Returns a fully configured Google OAuth2 client loaded with stored credentials,
 * with automatic database syncing of refreshed access tokens and refresh tokens.
 * Accurately models the integration as a singleton institutional connection.
 */
export async function getConnectedClient() {
  const expectedEmail = process.env.GOOGLE_CALENDAR_ACCOUNT || "psysphereclasses@gmail.com";
  const [creds] = await db
    .select()
    .from(googleCredentials)
    .where(eq(googleCredentials.accountEmail, expectedEmail.toLowerCase()))
    .limit(1);

  if (!creds) {
    return null;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: creds.accessToken,
    refresh_token: creds.refreshToken,
    expiry_date: creds.expiresAt ? creds.expiresAt.getTime() : undefined,
  });

  // Automatically persist newly refreshed access tokens and/or refresh tokens back to the database
  oauth2Client.on("tokens", async (newTokens) => {
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (newTokens.access_token) {
        updateData.accessToken = newTokens.access_token;
        updateData.expiresAt = newTokens.expiry_date ? new Date(newTokens.expiry_date) : null;
      }

      if (newTokens.refresh_token) {
        updateData.refreshToken = newTokens.refresh_token;
      }

      if (newTokens.access_token || newTokens.refresh_token) {
        await db
          .update(googleCredentials)
          .set(updateData)
          .where(eq(googleCredentials.id, creds.id));
      }
    } catch (err) {
      console.error("Failed to automatically update refreshed Google tokens in db:", err);
    }
  });

  return {
    client: oauth2Client,
    email: creds.accountEmail,
  };
}

/**
 * Creates a Google Calendar event with Google Meet conference capabilities.
 * Operates deterministically on a per-request basis with stable error resilience.
 * Uses extended properties for precise idempotency.
 */
export async function createCalendarEvent(params: {
  sessionId: string;
  title: string;
  batchName: string;
  topicTitle: string;
  startsAt: Date;
  endsAt: Date;
  teacherName: string | null;
}) {
  const connection = await getConnectedClient();
  if (!connection) {
    throw new GoogleIntegrationError("Google Calendar is not connected.");
  }

  const calendar = google.calendar({ version: "v3", auth: connection.client });

  const eventBody = {
    summary: params.title,
    description: `Cohort Batch: ${params.batchName}\nTopic: ${params.topicTitle}${
      params.teacherName ? `\nInstructor: ${params.teacherName}` : ""
    }`,
    start: {
      dateTime: params.startsAt.toISOString(),
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: params.endsAt.toISOString(),
      timeZone: "Asia/Kolkata",
    },
    extendedProperties: {
      private: {
        psysphereSessionId: params.sessionId,
      },
    },
    conferenceData: {
      createRequest: {
        requestId: params.sessionId,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: eventBody,
    });

    const event = response.data;
    const eventId = event.id;
    let meetUrl: string | null = null;

    if (event.conferenceData?.entryPoints) {
      const meetEntryPoint = event.conferenceData.entryPoints.find(
        (ep) => ep.entryPointType === "video"
      );
      if (meetEntryPoint?.uri) {
        meetUrl = meetEntryPoint.uri;
      }
    }

    if (!meetUrl && event.hangoutLink) {
      meetUrl = event.hangoutLink;
    }

    if (!meetUrl) {
      throw new GoogleIntegrationError(
        "Google Calendar event created, but Google Meet link was not generated. Please try again."
      );
    }

    return {
      eventId: eventId!,
      meetUrl,
    };
  } catch (error: any) {
    throw new GoogleIntegrationError(
      error.message || "Failed to schedule Google Calendar event or generate Google Meet."
    );
  }
}

/**
 * Searches Google Calendar for an existing event matching the given PsySphere session ID.
 */
export async function findCalendarEventBySessionId(sessionId: string) {
  const connection = await getConnectedClient();
  if (!connection) {
    throw new GoogleIntegrationError("Google Calendar is not connected.");
  }

  const calendar = google.calendar({ version: "v3", auth: connection.client });
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      privateExtendedProperty: [`psysphereSessionId=${sessionId}`],
      singleEvents: true,
    });

    const items = response.data.items || [];
    if (items.length > 0) {
      const event = items[0];
      let meetUrl: string | null = null;

      if (event.conferenceData?.entryPoints) {
        const meetEntryPoint = event.conferenceData.entryPoints.find(
          (ep: any) => ep.entryPointType === "video"
        );
        if (meetEntryPoint?.uri) {
          meetUrl = meetEntryPoint.uri;
        }
      }

      if (!meetUrl && event.hangoutLink) {
        meetUrl = event.hangoutLink;
      }

      return {
        eventId: event.id!,
        meetUrl,
      };
    }
  } catch (err: any) {
    console.warn(`Failed to check existing event by sessionId ${sessionId}:`, err.message || err);
  }

  return null;
}

/**
 * Deletes a Google Calendar event.
 */
export async function deleteCalendarEvent(eventId: string) {
  const connection = await getConnectedClient();
  if (!connection) return;

  const calendar = google.calendar({ version: "v3", auth: connection.client });
  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  } catch (err: any) {
    console.error(`Failed to delete Google Calendar event ${eventId}:`, err.message || err);
    throw err; // Propagate for correct compensation logic
  }
}

/**
 * Disconnects the Google Calendar integration.
 * Performs Google OAuth token revocation before deleting local credentials.
 * Handles failures gracefully without exposing credentials.
 */
export async function disconnectGoogle() {
  const expectedEmail = process.env.GOOGLE_CALENDAR_ACCOUNT || "psysphereclasses@gmail.com";
  const [creds] = await db
    .select()
    .from(googleCredentials)
    .where(eq(googleCredentials.accountEmail, expectedEmail.toLowerCase()))
    .limit(1);

  if (!creds) {
    return;
  }

  const oauth2Client = getOAuth2Client();
  try {
    if (creds.refreshToken) {
      await oauth2Client.revokeToken(creds.refreshToken);
    }
  } catch (err: any) {
    console.warn("Google token revocation failed or token was already invalid:", err.message || err);
  } finally {
    // Always clean up the database representation
    await db
      .delete(googleCredentials)
      .where(eq(googleCredentials.accountEmail, expectedEmail.toLowerCase()));
  }
}

