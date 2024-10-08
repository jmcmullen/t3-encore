import { api } from "encore.dev/api";
import {
  createApp,
  createRouter,
  promisifyNodeListener,
  toNodeListener,
} from "h3";

import { authLogOutHandler } from "./authentication.handler";
import {
  discordAuthCallbackHandler,
  discordAuthHandler,
} from "./providers/discord.handler";

export const authApp = createApp();
export const authRouter = createRouter();

authRouter.get("/auth/discord", discordAuthHandler);
authRouter.get("/auth/discord/callback", discordAuthCallbackHandler);
authRouter.get("/auth/logout", authLogOutHandler);

authApp.use(authRouter);

export const auth = api.raw(
  { expose: true, auth: false, method: "GET", path: "/auth/!rest" },
  promisifyNodeListener(toNodeListener(authApp)),
);
