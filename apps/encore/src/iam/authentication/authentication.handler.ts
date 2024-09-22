import { APIError, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

import { lucia } from "./authentication.config";

export interface AuthParams {
  authorization?: Header<"Authorization">;
  cookies?: Header<"Cookie">;
}

export const extractSessionId = (params: AuthParams): string | null => {
  if (params.cookies) {
    return lucia.readSessionCookie(params.cookies);
  }
  if (params.authorization) {
    return lucia.readBearerToken(params.authorization);
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
