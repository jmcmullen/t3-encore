import { omit } from "radash";

import { Post as DbPost } from "../db/schema";

export interface Post {
  /** ID of the post */
  id: string;
  /** Title of the post */
  title: string;
  /** Content of the post */
  content: string;
  /** Date the post was created */
  createdAt: string | null;
  /** Date the post was updated */
  updatedAt: string | null;
}

export interface CreatePostParams {
  /** Title of the post */
  title: string;
  /** Content of the post */
  content: string;
}

export interface UpdatePostParams {
  /** ID of the post */
  id: string;
  /** Title of the post */
  title?: string;
  /** Content of the post */
  content?: string;
}

export interface DeletePostParams {
  /** ID of the post */
  id: string;
}

export interface PostResponse {
  post: Post;
}

export interface PostListResponse {
  posts: Post[];
}

export const toPostEntity = (post: typeof DbPost.$inferSelect): Post => ({
  ...omit(post, ["updatedAt", "createdAt"]),
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt?.toISOString() ?? null,
});
