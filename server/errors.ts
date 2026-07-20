export class UnauthorizedRoleError extends Error {
  constructor(message: string = "Unauthorized role") {
    super(message);
    this.name = "UnauthorizedRoleError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
export class WebhookVerificationError extends Error {
  constructor(message: string = "Webhook verification failed") {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

export class IdentitySyncError extends Error {
  constructor(message: string = "Identity sync failed") {
    super(message);
    this.name = "IdentitySyncError";
  }
}
