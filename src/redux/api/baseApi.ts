/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setUser } from "../features/authSlice";
import { tagTypesList } from "../tagTypes";
import cookie from "js-cookie";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getRefreshApiUrl,
} from "@/utils/authTokens";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const otpToken = sessionStorage.getItem("token");
    const forgotPasswordToken = sessionStorage.getItem("forgotPasswordToken");
    // Prefer cookie so middleware-refreshed tokens are used before stale Redux state
    const token =
      cookie.get(ACCESS_TOKEN_COOKIE) || (getState() as any).auth.token;

    headers.set("ngrok-skip-browser-warning", "true");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    if (otpToken) {
      headers.set("token", otpToken);
    }
    if (forgotPasswordToken) {
      headers.set("token", forgotPasswordToken);
    }

    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

const forceLogout = (api: any) => {
  api.dispatch(logout());
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const refreshAccessToken = async (api: any): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = cookie.get(REFRESH_TOKEN_COOKIE);

      if (!refreshToken) {
        forceLogout(api);
        return null;
      }

      const res = await fetch(getRefreshApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      const accessToken =
        data?.data?.accessToken || data?.data?.token || data?.accessToken;
      const nextRefreshToken =
        data?.data?.refreshToken || data?.refreshToken;

      if (!res.ok || !accessToken) {
        forceLogout(api);
        return null;
      }

      const user = api.getState().auth.user;

      api.dispatch(
        setUser({
          user,
          token: accessToken,
          refreshToken: nextRefreshToken,
        }),
      );

      return accessToken as string;
    } catch (error) {
      console.error(error);
      forceLogout(api);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const baseQueryWithRefreshToken = async (
  args: any,
  api: any,
  extraOptions: any,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 || result?.error?.status === 403) {
    const newAccessToken = await refreshAccessToken(api);

    if (newAccessToken) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: tagTypesList,
  endpoints: () => ({}),
});
