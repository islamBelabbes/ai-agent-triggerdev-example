import z from "zod";

export const createPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  tdlr: z.string().optional(),
  category: z.string().optional(),
  nsfw: z.boolean().optional(),
});

export type Category = string;
export type Post = z.infer<typeof createPostSchema> & { id: string };

const CATEGORIES: Category[] = [
  "sports",
  "tech",
  "finance",
  "entertainment",
  "food",
  "travel",
  "health",
  "science",
  "education",
  "news",
  "business",
  "lifestyle",
  "celebrity",
  "music",
  "art",
  "design",
  "gaming",
  "movies",
  "books",
  "home",
  "garden",
  "pets",
  "technology",
  "cooking",
  "fitness",
  "healthy",
  "beauty",
  "fashion",
  "travel",
  "food",
  "outdoors",
  "photography",
  "cars",
  "vehicles",
  "boats",
  "kitchen",
  "furniture",
  "appliances",
  "electronics",
  "home",
  "garden",
  "pets",
  "technology",
  "cooking",
  "fitness",
  "healthy",
  "beauty",
  "fashion",
  "travel",
  "food",
  "outdoors",
  "photography",
  "cars",
  "vehicles",
  "boats",
  "kitchen",
  "furniture",
  "appliances",
  "electronics",
  "home",
  "garden",
  "pets",
  "technology",
  "cooking",
  "fitness",
  "healthy",
  "beauty",
  "fashion",
  "travel",
  "food",
  "outdoors",
  "photography",
  "cars",
  "vehicles",
  "boats",
  "kitchen",
  "furniture",
  "appliances",
  "electronics",
];

const POSTS: Post[] = [];

export default {
  posts: POSTS,
  categories: CATEGORIES,
};
