/**
 * Security utilities: SSRF protection, URL validation, and network isolation.
 */

const BLOCKED_IP_PATTERNS = [
  /^127\./,                           // Loopback 127.0.0.0/8
  /^10\./,                            // Private 10.0.0.0/8
  /^192\.168\./,                      // Private 192.168.0.0/16
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,   // Private 172.16.0.0/12
  /^169\.254\./,                      // Link-local / Cloud metadata 169.254.0.0/16
  /^0\./,                             // Current network 0.0.0.0/8
  /^fc00:/i,                          // IPv6 Unique local
  /^fe80:/i,                          // IPv6 Link-local
  /^::1$/,                            // IPv6 Loopback
  /^::$/,                             // IPv6 Unspecified
];

export function isSafePublicUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return { safe: false, error: "Missing or invalid URL." };
  }

  try {
    const parsed = new URL(urlString.trim());

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, error: "Only HTTP and HTTPS protocols are supported." };
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost names
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return { safe: false, error: "Local and internal domains are blocked." };
    }

    // Check blocked IP patterns
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(host)) {
        return { safe: false, error: "Access to private, loopback, and metadata IP addresses is prohibited." };
      }
    }

    return { safe: true, url: parsed.href };
  } catch {
    return { safe: false, error: "Malformed URL." };
  }
}
