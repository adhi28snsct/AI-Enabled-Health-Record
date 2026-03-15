import crypto from "crypto";

export const generateInviteToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, tokenHash };
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
