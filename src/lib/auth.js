import jwt from "jsonwebtoken";

const JWT_ALGORITHM = "HS256";
const SESSION_EXPIRY_HOURS = 24;
const REMEMBER_EXPIRY_DAYS = 30;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET environment variable is not configured. Server failing closed.");
  }
  return secret;
}

export function signToken(admin, rememberMe = false) {
  const expiresIn = rememberMe ? `${REMEMBER_EXPIRY_DAYS}d` : `${SESSION_EXPIRY_HOURS}h`;

  let perms = ["*"];
  if (admin.permissions_json) {
    try {
      perms = JSON.parse(admin.permissions_json);
    } catch {
      perms = ["*"];
    }
  }

  let sites = ["*"];
  if (admin.assigned_websites_json) {
    try {
      sites = JSON.parse(admin.assigned_websites_json);
    } catch {
      sites = ["*"];
    }
  }

  const payload = {
    sub: admin.username,
    uid: admin.id,
    type: "session",
    email: admin.email || "",
    role: admin.role || "super_admin",
    full_name: admin.full_name || "Super Admin",
    permissions: perms,
    websites: sites,
  };

  const token = jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn,
  });

  const decoded = jwt.decode(token);
  return { token, exp: decoded.exp };
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    if (!decoded || decoded.type === "2fa_challenge") {
      return null;
    }
    if (decoded.type && decoded.type !== "session") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function signChallengeToken(admin, rememberMe = false) {
  const payload = {
    type: "2fa_challenge",
    uid: admin.id,
    sub: admin.username,
    remember: rememberMe,
  };
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: "5m",
  });
}

export function verifyChallengeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    if (decoded.type !== "2fa_challenge") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function authenticateRequest(req) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  return verifyToken(token);
}
