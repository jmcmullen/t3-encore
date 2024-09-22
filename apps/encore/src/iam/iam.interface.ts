import { omit } from "radash";

import { Post } from "../posts/posts.interface";
import {
  Session as AuthSession,
  User as AuthUser,
} from "./authentication/authentication.config";

export interface CurrentSessionResponse {
  /** The currently authenticated user */
  user: {
    /** ID of the user */
    id: string;
    /** Name of the user */
    name: string;
    /** Email of the user */
    email: string;
  } | null;
  /** The current session */
  session: {
    /** ID of the session */
    id: string;
    /** Expiry of the session */
    expiresAt: string;
    /** Is the session fresh? */
    fresh: boolean;
    /** ID of the user */
    userId: string;
  } | null;
}

export interface LogOutResponse {
  /** Was the session invalidated? */
  success: boolean;
}

export const toEntity = ({
  user,
  session,
}: {
  user: AuthUser;
  session: AuthSession;
}): CurrentSessionResponse => ({
  user,
  session: {
    ...omit(session, ["expiresAt"]),
    expiresAt: session.expiresAt.toISOString(),
  },
});
