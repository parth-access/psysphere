export const EMAIL_DEFAULTS = {
  FROM:
    process.env.EMAIL_FROM ||
    "Saarthi Classes <hello@classes.saarthilife.com>",
  REPLY_TO:
    process.env.EMAIL_REPLY_TO ||
    "hello@classes.saarthilife.com",
  SUBJECT_PREFIX: "Saarthi Classes",
};