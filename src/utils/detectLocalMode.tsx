/**
 * Detects if we're in local development mode
 */
export const detectLocalMode = (): boolean => {
  // Server-side: use NODE_ENV
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }

  // Client-side: check hostname for localhost/127.0.0.1 patterns
  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("localhost:") ||
    hostname.startsWith("127.0.0.1:");

  // Only consider it local if BOTH conditions are met
  return process.env.NODE_ENV === "development" && isLocalhost;
};
