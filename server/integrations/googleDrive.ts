import { google } from "googleapis";
import { GoogleIntegrationError, getConnectedClient, hasDriveScope } from "./google";

async function driveConnection() {
  const connection = await getConnectedClient();
  if (!connection) throw new GoogleIntegrationError("Google is not connected.");
  if (!hasDriveScope(connection.scopes)) throw new GoogleIntegrationError("Google needs reconnecting to allow recordings.");
  return { client: connection.client, drive: google.drive({ version: "v3", auth: connection.client }) };
}

/** True when the app can use Drive. Older Google connections need reconnecting once. */
export async function driveReady() {
  const connection = await getConnectedClient();
  return !!connection && hasDriveScope(connection.scopes);
}

function statusOf(err: unknown) {
  const e = err as { status?: number; code?: number | string };
  return Number(e.status ?? e.code);
}

/** How much of the account's space is used. It's shared with that account's Gmail. Limit is null on unlimited plans. */
export async function driveSpace() {
  const { drive } = await driveConnection();
  const { data } = await drive.about.get({ fields: "storageQuota(limit,usage)" });
  const limit = data.storageQuota?.limit;
  return { used: Number(data.storageQuota?.usage ?? 0), limit: limit ? Number(limit) : null };
}

/**
 * Opens an upload the browser can send straight to Drive, so a big file never passes through our server.
 * Drive only accepts the browser's requests from the origin named here.
 */
export async function startDriveUpload(p: { name: string; mimeType: string; bytes: number; origin: string; sessionId: string }) {
  const { client } = await driveConnection();
  const { token } = await client.getAccessToken();
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-upload-content-type": p.mimeType,
      "x-upload-content-length": String(p.bytes),
      origin: p.origin,
    },
    body: JSON.stringify({ name: p.name, mimeType: p.mimeType, appProperties: { saarthiSessionId: p.sessionId } }),
  });
  const uploadUrl = res.headers.get("location");
  if (!res.ok || !uploadUrl) throw new GoogleIntegrationError(`Drive refused the upload (${res.status}).`);
  return uploadUrl;
}

/** What Drive knows about a file, or null if it's gone. durationMillis appears once the video can be played. */
export async function getDriveVideo(fileId: string) {
  const { drive } = await driveConnection();
  try {
    const { data } = await drive.files.get({ fileId, fields: "id,size,mimeType,appProperties,videoMediaMetadata(durationMillis)" });
    return {
      bytes: Number(data.size ?? 0),
      mimeType: data.mimeType ?? "",
      sessionId: data.appProperties?.saarthiSessionId ?? null,
      playable: !!data.videoMediaMetadata?.durationMillis,
    };
  } catch (err) {
    if (statusOf(err) === 404) return null;
    throw err;
  }
}

/** Blocks downloading first, then lets anyone with the link watch. In that order: Drive's processing screen offers a download. */
export async function shareForViewing(fileId: string) {
  const { drive } = await driveConnection();
  await drive.files.update({
    fileId,
    requestBody: { copyRequiresWriterPermission: true, downloadRestrictions: { itemDownloadRestriction: { restrictedForReaders: true } } },
  });
  await drive.permissions.create({ fileId, requestBody: { type: "anyone", role: "reader" } });
}

/** Deletes for good, skipping the bin, so the space comes back at once. A file that's already gone counts as done. */
export async function deleteDriveFile(fileId: string) {
  const { drive } = await driveConnection();
  try {
    await drive.files.delete({ fileId });
  } catch (err) {
    if (statusOf(err) !== 404) throw err;
  }
}

/** Every file this app has put in Drive. The app can't see anything else there. */
export async function listDriveFiles() {
  const { drive } = await driveConnection();
  const files: { id: string; createdAt: Date }[] = [];
  let pageToken: string | undefined;
  do {
    const { data } = await drive.files.list({ pageSize: 100, pageToken, fields: "nextPageToken,files(id,createdTime)" });
    for (const f of data.files ?? []) if (f.id) files.push({ id: f.id, createdAt: new Date(f.createdTime ?? 0) });
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);
  return files;
}
