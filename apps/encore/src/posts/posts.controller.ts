import { desc, eq } from "drizzle-orm";
import { Result } from "drizzle-orm/sqlite-core";
import { api, APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { Session, User } from "lucia";
import { omit } from "radash";

import { db } from "../db/client";
import { lucia } from "../iam/authentication/authentication.config";
import { auth } from "../iam/authentication/authentication.controller";
import { Post } from "./../db/schema";
import {
  CreatePostDto,
  PostListResponse,
  PostResponse,
  toEntity,
  UpdatePostDto,
} from "./posts.interface";

export const list = api(
  { expose: true, auth: false, method: "GET", path: "/posts" },
  async (): Promise<PostListResponse> => {
    const results = await db.query.Post.findMany({
      orderBy: desc(Post.id),
      limit: 10,
    });
    return { posts: results.map((post) => toEntity(post)) };
  },
);

export const findOne = api(
  { expose: true, auth: false, method: "GET", path: "/posts/:id" },
  async (params: { id: string }): Promise<PostResponse> => {
    const result = await db.query.Post.findFirst({
      where: eq(Post.id, params.id),
    });
    if (!result) throw APIError.notFound(`Unable to find post: ${params.id}`);
    return { post: toEntity(result) };
  },
);

export const create = api(
  { expose: true, auth: true, method: "POST", path: "/posts" },
  async (params: CreatePostDto): Promise<PostResponse> => {
    const result = await db.insert(Post).values(params).returning();
    if (!result) throw APIError.unavailable(`Unable to create post`);
    return { post: toEntity(result[0]) };
  },
);

export const update = api(
  { expose: true, auth: true, method: "PATCH", path: "/posts" },
  async (params: UpdatePostDto): Promise<PostResponse> => {
    const result = await db
      .update(Post)
      .set(omit(params, ["id"]))
      .where(eq(Post.id, params.id))
      .returning();
    if (!result) throw APIError.unavailable(`Unable to create post`);
    return { post: toEntity(result[0]) };
  },
);

export const remove = api(
  { expose: true, auth: true, method: "POST", path: "/posts/:id" },
  async (params: { id: string }): Promise<PostResponse> => {
    const result = await db
      .delete(Post)
      .where(eq(Post.id, params.id))
      .returning();
    if (!result) throw APIError.unavailable(`Unable to delete post`);
    return { post: toEntity(result[0]) };
  },
);

interface AuthParams {
  authorization?: Header<"Authorization">;
  cookies?: Header<"Cookie">;
}

export const luciaHandler = authHandler(
  async (params: AuthParams): Promise<{ userID: string }> => {
    const extractSessionId = (): string | null => {
      if (params.cookies) {
        return lucia.readSessionCookie(params.cookies);
      }
      if (params.authorization) {
        return lucia.readBearerToken(params.authorization);
      }
      return null;
    };

    const sessionId = extractSessionId();
    if (sessionId) {
      const { user } = await lucia.validateSession(sessionId);
      if (user?.id) {
        return { userID: user.id };
      }
    }

    throw APIError.unauthenticated("Not logged in");
  },
);

export const gateway = new Gateway({ authHandler: luciaHandler });
