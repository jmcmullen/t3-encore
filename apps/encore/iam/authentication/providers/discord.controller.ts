import { generateState, OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import log from "encore.dev/log";
import {
  appendHeader,
  createError,
  eventHandler,
  getCookie,
  getQuery,
  sendRedirect,
  setCookie,
} from "h3";

import { db } from "../../../db/client";
import { User } from "../../../db/schema";
import { lucia } from "../authentication.config";
import {
  COOKIE_STATE_KEY,
  discord,
  DiscordUser,
  getUserDetails,
} from "./discord.config";

export const discordAuthHandler = eventHandler(async (event) => {
  const state = generateState();
  const url = await discord.createAuthorizationURL(state, {
    scopes: ["identify", "email"],
  });
  setCookie(event, COOKIE_STATE_KEY, state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  return sendRedirect(event, url.toString());
});

export const discordAuthCallbackHandler = eventHandler(async (event) => {
  const { code, state } = getQuery(event);
  const storedState = getCookie(event, COOKIE_STATE_KEY);
  if (!code || !state || !storedState || state !== storedState) {
    throw createError({
      status: 400,
      statusMessage: "Bad Request",
      message: "Invalid authentication request",
    });
  }
  try {
    const tokens = await discord.validateAuthorizationCode(code as string);
    const userResponse: DiscordUser = await getUserDetails(tokens.accessToken);
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, userResponse.email));
    if (existingUser[0]) {
      log.info("Exists", existingUser);
      const session = await lucia.createSession(existingUser[0].id, {});
      appendHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
      );
      return sendRedirect(event, "/auth/me");
    }
    const user = await db
      .insert(User)
      .values({ name: userResponse.global_name, email: userResponse.email })
      .returning();
    if (!user[0]) {
      log.info("Created", user);
      throw createError({
        status: 500,
        statusMessage: "Server Error",
        message: "Unable to create user",
      });
    }
    const session = await lucia.createSession(user[0].id, {});
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize(),
    );
    return sendRedirect(event, "/auth/me");
  } catch (err) {
    log.error(err);
    if (
      err instanceof OAuth2RequestError &&
      err.message === "bad_verification_code"
    ) {
      throw createError({
        status: 400,
        statusMessage: "Bad Request",
        message: "Invalid login request",
      });
    }
    throw createError({
      status: 500,
    });
  }
});
