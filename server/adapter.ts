import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import { z } from "zod";
import { sessionTable, userRelations, userTable } from "./db/schemas/auth";
import { postsRelations, postsTable } from "./db/schemas/posts";
import { commentRelations, commentsTable } from "./db/schemas/comments";
import {
  commentUpvotesRelations,
  commentUpvotesTable,
  postUpvotesRelations,
  postUpvotesTable,
} from "./db/schemas/upvotes";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const processEnv = EnvSchema.parse(process.env);

const queryClient = postgres(processEnv.DATABASE_URL);

export const db = drizzle(queryClient, {
  schema: {
    user: userTable,
    session: sessionTable,
    post: postsTable,
    comments: commentsTable,
    postUpvotes: postUpvotesTable,
    commentsUpvoted: commentUpvotesTable,
    postsRelations,
    commentRelations,
    commentUpvotesRelations,
    postUpvotesRelations,
    userRelations,
  },
});

export const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessionTable,
  userTable
);
