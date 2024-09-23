import { api } from "encore.dev/api";
import log from "encore.dev/log";

import { lucia } from "./authentication/authentication.config";
import {
  AuthParams,
  extractSessionId,
} from "./authentication/authentication.handler";
import {
  CurrentSessionResponse,
  LogOutResponse,
  toCurrentSessionEntity,
} from "./iam.interface";

export const currentUser = api(
  { expose: true, method: "GET", path: "/iam/session" },
  async (params: AuthParams): Promise<CurrentSessionResponse> => {
    const sessionId = extractSessionId(params);

    if (sessionId) {
      const response = await lucia.validateSession(sessionId);
      if (response.session && response.user) {
        return toCurrentSessionEntity(response);
      }
    }
    return { user: null, session: null };
  },
);

export const logout = api(
  { expose: true, method: "GET", path: "/iam/log-out" },
  async (params: AuthParams): Promise<LogOutResponse> => {
    const sessionId = extractSessionId(params);
    if (sessionId) {
      await lucia.invalidateSession(sessionId);
    }
    return { success: true };
  },
);
