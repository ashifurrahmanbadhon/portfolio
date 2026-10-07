import crypto from "crypto";

// RFC 3548 Base32 alphabet
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 20) {
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

function base32ToBuffer(base32Str) {
  const clean = base32Str.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secret, timestamp = Date.now()) {
  const epoch = Math.floor(timestamp / 1000);
  const timeStep = Math.floor(epoch / 30);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep));

  const key = base32ToBuffer(secret);
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

export function verifyTOTP(token, secret, window = 1) {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  const now = Date.now();
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const checkTime = now + errorWindow * 30 * 1000;
    if (generateTOTP(secret, checkTime) === cleanToken) {
      return true;
    }
  }
  return false;
}

export function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}
