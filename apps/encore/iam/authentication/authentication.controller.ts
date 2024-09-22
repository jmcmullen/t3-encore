import { api } from "encore.dev/api";
import {
  createApp,
  createRouter,
  eventHandler,
  getCookie,
  promisifyNodeListener,
  toNodeListener,
} from "h3";

import { AUTH_SESSION_KEY, lucia } from "./authentication.config";
import {
  discordAuthCallbackHandler,
  discordAuthHandler,
} from "./providers/discord.controller";

export const authApp = createApp();
export const authRouter = createRouter();

const currentUserAuthHandler = eventHandler(async (event) => {
  const sessionId = getCookie(event, AUTH_SESSION_KEY);
  if (sessionId) {
    return lucia.validateSession(sessionId);
  }
  return null;
});

authRouter.get("/auth/me", currentUserAuthHandler);
authRouter.get("/auth/discord", discordAuthHandler);
authRouter.get("/auth/discord/callback", discordAuthCallbackHandler);

authApp.use(authRouter);

export const auth = api.raw(
  { expose: true, auth: false, method: "GET", path: "/auth/!rest" },
  promisifyNodeListener(toNodeListener(authApp)),
);
