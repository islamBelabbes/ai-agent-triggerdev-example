import express from "express";
import cookieParser from "cookie-parser";
import { createPost, getPosts, updatePost } from "./post-service";
import { createPostSchema } from "./db";
import { getCategories } from "./category-service";

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/api/posts", async (_, res) => {
  const posts = await getPosts();
  res.send(posts);
});

app.post("/api/posts", async (req, res) => {
  const { title, content } = req.body;
  const data = createPostSchema.parse({ title, content });

  const post = await createPost(data);

  // do ai work
  res.send(post);
});

app.put("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, tdlr, category, nsfw } = req.body;
  const data = createPostSchema.parse({ title, content, tdlr, category, nsfw });

  console.log("post update api");
  console.log(data);

  const post = await updatePost({ id, ...data });
  res.send(post);
});

app.get("/api/categories", async (req, res) => {
  const categories = await getCategories();
  res.send(categories);
});

// error handler
app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

// 404
app.use((_, res) => {
  res.status(404).send("Not Found");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
