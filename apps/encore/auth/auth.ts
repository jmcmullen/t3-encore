import { IncomingMessage } from "http";
import { Auth } from "@auth/core";
import Discord from "@auth/core/providers/discord";
import { api, APIError, Gateway, Header, RawRequest } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import { eventHandler, toWebRequest } from "h3";

interface LoginParams {
  email: string;
  password: string;
}

export const login = api(
  { expose: true, auth: false, method: "GET", path: "/login" },
  async (params: LoginParams): Promise<{ token: string }> => {
    // ... get the userID from database or third party service like Auth0 or Clerk ...
    // ... create and sign a token ...

    return { token: "dummy-token" };
  },
);

interface AuthParams {
  authorization: Header<"Authorization">;
}

// The function passed to authHandler will be called for all incoming API call that requires authentication.
// Remove if your app does not require authentication.
export const myAuthHandler = authHandler(
  async (params: AuthParams): Promise<{ userID: string }> => {
    // ... verify and decode token to get the userID ...
    // ... get user info from database or third party service like Auth0 or Clerk ...

    if (!params.authorization) {
      throw APIError.unauthenticated("no token provided");
    }
    if (params.authorization !== "dummy-token") {
      throw APIError.unauthenticated("invalid token");
    }

    return { userID: "dummy-user-id" };
  },
);

export const authProxy = api(
  { expose: true, method: "*", path: "/proxy/!rest" },
  eventHandler(async (event) =>
    Auth(toWebRequest(event), {
      secret: secret("AUTH_SECRET")(),
      // trustHost: !!process.env.VERCEL,
      redirectProxyUrl: secret("AUTH_REDIRECT_PROXY_URL")(),
      providers: [
        Discord({
          clientId: secret("AUTH_DISCORD_ID")(),
          clientSecret: secret("AUTH_DISCORD_SECRET")(),
        }),
      ],
    }),
  ),
);

export const gateway = new Gateway({ authHandler: myAuthHandler });
