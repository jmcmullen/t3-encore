import { omit } from "radash";

import { Post } from "../db/schema";

export interface PostDto {
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

export interface CreatePostDto {
  /** Title of the post */
  title: string;
  /** Content of the post */
  content: string;
}

export interface UpdatePostDto {
  /** ID of the post */
  id: string;
  /** Title of the post */
  title?: string;
  /** Content of the post */
  content?: string;
}

export interface PostResponse {
  post: PostDto;
}

export interface PostListResponse {
  posts: PostDto[];
}

export const toEntity = (post: typeof Post.$inferSelect): PostDto => ({
  ...omit(post, ["updatedAt", "createdAt"]),
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt?.toISOString() ?? null,
});
