export const EMAIL_DEFAULTS = {
  // Sent from a no-reply address; replies go to EMAIL_REPLY_TO when it's set.
  FROM:
    process.env.EMAIL_FROM ||
    "Saarthi Classes <no-reply@classes.saarthilife.com>",
  REPLY_TO: process.env.EMAIL_REPLY_TO || undefined,
  // Where join-request and contact-form alerts go. Set in env, never hard-coded.
  ADMIN: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_REPLY_TO || undefined,
  SUBJECT_PREFIX: "Saarthi Classes",
};
