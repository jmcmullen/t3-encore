import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import log from "encore.dev/log";
import { ZodError } from "zod";

import { db } from "../../../db/client";
import { User } from "../../../db/schema";
import {
  CurrentSessionResponse,
  toCurrentSessionEntity,
} from "../../iam.interface";
import { lucia } from "../authentication.config";
import { hashPassword, verifyPassword } from "../hashing.utils";
import { SignInParams, SignUpParams, SignUpSchema } from "./password.interface";

export const signUp = api(
  { expose: true, method: "GET", path: "/auth/sign-up" },
  async (params: SignUpParams): Promise<CurrentSessionResponse> => {
    try {
      const { email, name, password } = SignUpSchema.parse(params);
      const hashedPassword = await hashPassword(password);
      const user = await db
        .insert(User)
        .values({
          email,
          name,
          hashedPassword,
        })
        .returning();
      const session = await lucia.createSession(user[0].id, {});
      return toCurrentSessionEntity({ user: user[0], session });
    } catch (err: any) {
      if (err instanceof ZodError) {
        throw APIError.failedPrecondition(err.issues[0].message, err);
      }
      // Unique constraint
      if (err?.code === "23505") {
        throw APIError.alreadyExists(
          `A user already exists with that email address`,
        );
      }
      throw APIError.aborted("Something went wrong");
    }
  },
);

export const signIn = api(
  { expose: true, method: "GET", path: "/auth/sign-in" },
  async (params: SignInParams): Promise<CurrentSessionResponse> => {
    try {
      const { email, password } = params;
      const existingUser = await db
        .select()
        .from(User)
        .where(eq(User.email, email));
      if (!existingUser[0]) {
        throw APIError.notFound("Incorrect email address or password");
      }
      if (!existingUser[0].hashedPassword) {
        throw APIError.notFound("Incorrect login method");
      }
      const validPassword = await verifyPassword(
        existingUser[0].hashedPassword,
        password,
      );
      if (!validPassword) {
        throw APIError.notFound("Incorrect email address or password");
      }
      const session = await lucia.createSession(existingUser[0].id, {});
      return toCurrentSessionEntity({ user: existingUser[0], session });
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      throw APIError.aborted("Something went wrong");
    }
  },
);
