import crypto from "crypto";

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate short unique payment reference for bank transfers (e.g. INV-A1B2C3). Server-only. */
export function generatePaymentReference(): string {
  let s = "INV-";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) s += ALPHANUM[bytes[i]! % ALPHANUM.length];
  return s;
}
