import { desc, eq } from "drizzle-orm";
import { Result } from "drizzle-orm/sqlite-core";
import { api, APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { Session, User } from "lucia";
import { omit } from "radash";

import { db } from "../db/client";
import { lucia } from "../iam/authentication/authentication.config";
import { luciaHandler } from "../iam/authentication/authentication.handler";
import { Post } from "./../db/schema";
import {
  CreatePostParams,
  DeletePostParams,
  PostListResponse,
  PostResponse,
  toPostEntity,
  UpdatePostParams,
} from "./posts.interface";

export const list = api(
  { expose: true, auth: false, method: "GET", path: "/posts" },
  async (): Promise<PostListResponse> => {
    const results = await db.query.Post.findMany({
      orderBy: desc(Post.id),
      limit: 10,
    });
    return { posts: results.map((post) => toPostEntity(post)) };
  },
);

export const findOne = api(
  { expose: true, auth: false, method: "GET", path: "/posts/:id" },
  async (params: { id: string }): Promise<PostResponse> => {
    const result = await db.query.Post.findFirst({
      where: eq(Post.id, params.id),
    });
    if (!result) throw APIError.notFound(`Unable to find post: ${params.id}`);
    return { post: toPostEntity(result) };
  },
);

export const create = api(
  { expose: true, auth: true, method: "POST", path: "/posts" },
  async (params: CreatePostParams): Promise<PostResponse> => {
    const result = await db.insert(Post).values(params).returning();
    if (!result) throw APIError.unavailable(`Unable to create post`);
    return { post: toPostEntity(result[0]) };
  },
);

export const update = api(
  { expose: true, auth: true, method: "PATCH", path: "/posts" },
  async (params: UpdatePostParams): Promise<PostResponse> => {
    const result = await db
      .update(Post)
      .set(omit(params, ["id"]))
      .where(eq(Post.id, params.id))
      .returning();
    if (!result) throw APIError.unavailable(`Unable to create post`);
    return { post: toPostEntity(result[0]) };
  },
);

export const remove = api(
  { expose: true, auth: true, method: "POST", path: "/posts/:id" },
  async (params: DeletePostParams): Promise<PostResponse> => {
    const result = await db
      .delete(Post)
      .where(eq(Post.id, params.id))
      .returning();
    if (!result) throw APIError.unavailable(`Unable to delete post`);
    return { post: toPostEntity(result[0]) };
  },
);

export const gateway = new Gateway({ authHandler: luciaHandler });
