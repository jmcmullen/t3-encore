import { APIError, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { eventHandler, getHeader, getQuery, sendRedirect } from "h3";

import { lucia } from "./authentication.config";

export interface AuthParams {
  authorization?: Header<"Authorization">;
  cookies?: Header<"Cookie">;
}

export const extractSessionId = (params: AuthParams): string | null => {
  if (params.cookies) {
    const sessionId = lucia.readSessionCookie(params.cookies);
    if (sessionId) return sessionId;
  }
  if (params.authorization) {
    const sessionId = lucia.readBearerToken(params.authorization);
    if (sessionId) return sessionId;
  }
  return null;
};

export const luciaHandler = authHandler(
  async (params: AuthParams): Promise<{ userID: string }> => {
    const sessionId = extractSessionId(params);
    if (sessionId) {
      const { user } = await lucia.validateSession(sessionId);
      if (user?.id) {
        return { userID: user.id };
      }
    }

    throw APIError.unauthenticated("Not logged in");
  },
);

export const authLogOutHandler = eventHandler(async (event) => {
  const authorization = getHeader(event, "Authorization");
  const cookies = getHeader(event, "Cookie");
  const sessionId = extractSessionId({ authorization, cookies });
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  const { redirect } = getQuery(event);
  if (redirect) {
    sendRedirect(event, redirect as string);
  }
  return { success: true };
});

export const isMobileUrl = (url: string) => {
  return !(
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  );
};

export const redirectUrl = (sessionId: string, redirect?: string) => {
  const params = new URLSearchParams();
  const redirectUrl = redirect ?? "/";

  if (redirect && isMobileUrl(redirect)) {
    params.append("sessionId", sessionId);
  }

  return `${redirectUrl}?${params.toString()}`;
};

export const redirectErrorUrl = (redirect?: string) => {
  const params = new URLSearchParams();
  const redirectUrl = redirect ?? "/";

  if (redirect && isMobileUrl(redirect)) {
    params.append("sessionId", "error");
  } else {
    params.append("error", "true");
  }

  return `${redirectUrl}?${params.toString()}`;
};
