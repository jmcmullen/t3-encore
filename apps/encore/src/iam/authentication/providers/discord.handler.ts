import { generateState, OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import log from "encore.dev/log";
import {
  appendHeader,
  eventHandler,
  getCookie,
  getQuery,
  sendRedirect,
  setCookie,
} from "h3";

import { db } from "../../../db/client";
import { User } from "../../../db/schema";
import { lucia } from "../authentication.config";
import { redirectErrorUrl, redirectUrl } from "../authentication.handler";
import {
  COOKIE_OPTIONS,
  COOKIE_REDIRECT_KEY,
  COOKIE_STATE_KEY,
  discord,
  DiscordUser,
  getUserDetails,
} from "./discord.config";

export const discordAuthHandler = eventHandler(async (event) => {
  const { redirect } = getQuery(event);
  const state = generateState();
  const url = await discord.createAuthorizationURL(state, {
    scopes: ["identify", "email"],
  });
  setCookie(event, COOKIE_STATE_KEY, state, {
    ...COOKIE_OPTIONS,
    sameSite: "lax",
  });
  if (redirect) {
    setCookie(event, COOKIE_REDIRECT_KEY, redirect as string, {
      ...COOKIE_OPTIONS,
      sameSite: "lax",
    });
  }
  return sendRedirect(event, url.toString());
});

export const discordAuthCallbackHandler = eventHandler(async (event) => {
  const { code, state } = getQuery(event);
  const redirect = getCookie(event, COOKIE_REDIRECT_KEY);
  const storedState = getCookie(event, COOKIE_STATE_KEY);
  if (!code || !state || !storedState || state !== storedState) {
    throw new Error("Invalid state");
  }
  try {
    const tokens = await discord.validateAuthorizationCode(code as string);
    const userResponse: DiscordUser = await getUserDetails(tokens.accessToken);
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, userResponse.email));
    if (existingUser[0]) {
      if (!userResponse.verified) {
        throw new Error("Email is not verified");
      }
      const session = await lucia.createSession(existingUser[0].id, {});
      appendHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
      );
      return sendRedirect(event, redirectUrl(session.id, redirect));
    }
    const user = await db
      .insert(User)
      .values({ name: userResponse.global_name, email: userResponse.email })
      .returning();
    if (!user[0]) {
      throw new Error("Unable to create user");
    }
    const session = await lucia.createSession(user[0].id, {});
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize(),
    );
    return sendRedirect(event, redirectUrl(session.id, redirect));
  } catch (err) {
    log.error(err);
    if (err instanceof Error) {
      return sendRedirect(event, redirectErrorUrl(redirect));
    }
  }
});
