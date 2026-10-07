import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ashifur_portfolio_secure_secret_key_2026_x9f";
const JWT_ALGORITHM = "HS256";
const SESSION_EXPIRY_HOURS = 24;
const REMEMBER_EXPIRY_DAYS = 30;

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
    email: admin.email || "",
    role: admin.role || "super_admin",
    full_name: admin.full_name || "Super Admin",
    permissions: perms,
    websites: sites,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn,
  });

  const decoded = jwt.decode(token);
  return { token, exp: decoded.exp };
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
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
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: "5m",
  });
}

export function verifyChallengeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
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
