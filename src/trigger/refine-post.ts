import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { logger, schemaTask, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { Output, generateObject, generateText, tool } from "ai";
import z from "zod";
import { Category } from "../db";

const skipAi = false;

const modal = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Replace with your real API key
});

const postSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const getAvailableCategoriesTool = tool({
  description: "Get the available categories for a post",
  parameters: z.object({}),
  // location below is inferred to be a string:
  execute: async () => {
    const categories = await fetch("http://localhost:3000/api/categories");
    const res = await categories.json();
    return res as Category[];
  },
});

export const generateTdlrTask = schemaTask({
  id: "generate-tdlr-task",
  schema: postSchema.pick({ content: true }),
  run: async (payload) => {
    if (skipAi) return "tdlr";
    const response = await generateObject({
      model: modal("gemini-2.0-flash"),
      prompt: `Generate tdlr from this post
      content : ${payload.content}
      `,
      schema: z.object({
        tdlr: z.string(),
      }),
    });

    logger.info(`tdlr : ${response.object.tdlr}`);

    return response.object.tdlr;
  },
});

export const determinateCategoryTask = schemaTask({
  id: "determinate-category-task",
  schema: postSchema,
  run: async (payload) => {
    if (skipAi) return "default";
    logger.info("new deploy");
    const { experimental_output, toolCalls } = await generateText({
      model: modal("gemini-2.0-flash"),
      system:
        "using the getAvailableCategoriesTool to get tha available categories and pick one for the given post this post",
      prompt: ` 
    content : ${payload.content}
     title : ${payload.title}
     `,
      experimental_output: Output.object({
        schema: z.object({
          category: z.string(),
        }),
      }),
      tools: { getAvailableCategoriesTool },
    });

    logger.info(`ai tool info : ${toolCalls}`);
    logger.info(`category : ${experimental_output.category}`);

    return experimental_output.category;
  },
});

export const isNsfwTask = schemaTask({
  id: "is-nsfw-task",
  schema: postSchema,
  run: async (payload) => {
    if (skipAi) return false;
    const response = await generateObject({
      model: modal("gemini-2.0-flash"),
      prompt: `Is this post nsfw?
      title : ${payload.title}
      content : ${payload.content}
      `,
      schema: z.object({
        isNsfw: z.boolean(),
      }),
    });

    logger.info(`isNsfw : ${response.object.isNsfw}`);

    return response.object.isNsfw;
  },
});

export const refinePostTask = schemaTask({
  id: "refine-post-task",
  schema: postSchema.extend({ id: z.string() }),
  run: async (payload) => {
    // is post nsfw?
    const isNsfw = await isNsfwTask.triggerAndWait(payload);
    if (!isNsfw.ok) {
      throw new AbortTaskRunError(`task failed: ${isNsfw.taskIdentifier}`);
    }

    // generate tdlr
    const category = await determinateCategoryTask.triggerAndWait(payload);
    if (!category.ok) {
      throw new AbortTaskRunError(`task failed: ${category.taskIdentifier}`);
    }

    // determinate category
    const tdlr = await generateTdlrTask.triggerAndWait(payload);
    if (!tdlr.ok) {
      throw new AbortTaskRunError(`task failed: ${tdlr.taskIdentifier}`);
    }

    // update post
    const data = {
      ...payload,
      nsfw: isNsfw.output,
      category: category.output,
      tdlr: tdlr.output,
    };
    logger.info(`updating post ${data.id}`);
    logger.info(`updating post ${JSON.stringify(data)}`);
    const response = await fetch(
      `http://localhost:3000/api/posts/${payload.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (response.ok) logger.info("post updated");
    return true;
  },
});
