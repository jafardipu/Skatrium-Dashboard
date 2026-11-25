import { NextRequest, NextResponse } from "next/server";
import { authRoutes } from "./utils/authRoutes";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getRefreshApiUrl,
  isAccessTokenValid,
} from "./utils/authTokens";

function clearAuthAndRedirectToLogin(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

async function refreshAccessToken(
  req: NextRequest,
  refreshToken: string,
): Promise<{ accessToken?: string; refreshToken?: string } | null> {
  try {
    const res = await fetch(getRefreshApiUrl(req.nextUrl.origin), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    const accessToken =
      data?.data?.accessToken || data?.data?.token || data?.accessToken;
    const nextRefreshToken =
      data?.data?.refreshToken || data?.refreshToken || refreshToken;

    if (!accessToken) return null;

    return { accessToken, refreshToken: nextRefreshToken };
  } catch {
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const hasValidAccessToken = isAccessTokenValid(accessToken);

  // Logged-in users should not stay on auth pages
  if (isAuthRoute && hasValidAccessToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Auth pages are public
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Valid access token — continue
  if (hasValidAccessToken) {
    return NextResponse.next();
  }

  // Access missing/expired — try refresh
  if (!refreshToken) {
    return clearAuthAndRedirectToLogin(req);
  }

  const refreshed = await refreshAccessToken(req, refreshToken);

  if (!refreshed?.accessToken) {
    return clearAuthAndRedirectToLogin(req);
  }

  const response = NextResponse.next();
  response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
    path: "/",
    sameSite: "lax",
  });

  if (refreshed.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, {
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/forget-password",
    "/reset-password",
    "/verify-email",
  ],
};
