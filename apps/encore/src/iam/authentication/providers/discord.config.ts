import { Discord } from "arctic";
import { secret } from "encore.dev/config";

const clientId = secret("AUTH_DISCORD_ID")();
const clientSecret = secret("AUTH_DISCORD_SECRET")();
const redirectUrl = secret("AUTH_DISCORD_REDIRECT")();

export const discord = new Discord(clientId, clientSecret, redirectUrl);

export const COOKIE_STATE_KEY = "discord_oauth_state";
export const COOKIE_REDIRECT_KEY = "redirect_url";
export const COOKIE_OPTIONS = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 60 * 10,
};

export const getUserDetails = async (accessToken: string) => {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
};

export interface DiscordUser {
  id: string;
  global_name: string;
  email: string;
  verified: boolean;
}
