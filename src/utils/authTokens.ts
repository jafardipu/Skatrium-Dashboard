export const ACCESS_TOKEN_COOKIE = "skatrium-access-token";
export const REFRESH_TOKEN_COOKIE = "skatrium-refresh-token";

export function isAccessTokenValid(token?: string | null): boolean {
  if (!token) return false;

  try {
    const segment = token.split(".")[1];
    if (!segment) return false;

    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded));

    // Refresh slightly before expiry to avoid race conditions
    return (
      typeof payload.exp === "number" && payload.exp * 1000 > Date.now() + 30_000
    );
  } catch {
    return false;
  }
}

export function getRefreshApiUrl(origin?: string): string {
  const path = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh-token`;
  if (origin) return new URL(path, origin).toString();
  return path;
}
