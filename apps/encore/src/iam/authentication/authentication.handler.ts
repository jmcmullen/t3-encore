import { eventHandler, getCookie } from "h3";

import { AUTH_SESSION_KEY, lucia } from "./authentication.config";

export const currentUserAuthHandler = eventHandler(async (event) => {
  const sessionId = getCookie(event, AUTH_SESSION_KEY);
  if (sessionId) {
    return lucia.validateSession(sessionId);
  }
  return null;
});

export const logoutHandler = eventHandler(async (event) => {
  const sessionId = getCookie(event, AUTH_SESSION_KEY);
  if (sessionId) {
    return lucia.invalidateSession(sessionId);
  }
  return null;
});
