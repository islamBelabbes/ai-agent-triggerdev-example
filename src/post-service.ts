import { createId } from "@paralleldrive/cuid2";
import db, { Post } from "./db";

export const getPosts = async () => {
  return db.posts;
};

export const createPost = async (post: {
  title: Post["title"];
  content: Post["content"];
}) => {
  const createdPost = {
    ...post,
    id: createId(),
  };

  db.posts.push(createdPost);
  return createdPost;
};

export const updatePost = async (post: Post) => {
  console.log(post, "looking for:", db.posts);

  const postToUpdate = db.posts.find((p) => p.id === post.id);
  if (!postToUpdate) throw new Error("Post not found");

  postToUpdate.title = post.title;
  postToUpdate.content = post.content;
  postToUpdate.tdlr = post.tdlr;
  postToUpdate.category = post.category;
  postToUpdate.nsfw = post.nsfw;

  // replace updated post
  db.posts.splice(
    db.posts.findIndex((p) => p.id === post.id),
    1,
    postToUpdate
  );

  return postToUpdate;
};
