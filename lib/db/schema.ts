import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  disabled: boolean("disabled").notNull().default(false),
  razorpayCustomerId: text("razorpayCustomerId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const platformProject = pgTable("PlatformProject", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  sourceUrl: text("sourceUrl"),
  sourceType: varchar("sourceType", {
    enum: ["url", "github", "markdown", "openapi", "postman", "html"],
  }).notNull(),
  status: varchar("status", {
    enum: ["pending", "crawling", "analyzing", "generating", "ready", "error"],
  })
    .notNull()
    .default("pending"),
  artifacts: json("artifacts"),
  crawlData: json("crawlData"),
  logs: json("logs"),
  tokenUsage: json("tokenUsage"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type PlatformProject = InferSelectModel<typeof platformProject>;

export const mcpServer = pgTable("McpServer", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => platformProject.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  config: json("config").notNull(),
  tools: json("tools").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type McpServer = InferSelectModel<typeof mcpServer>;

export const aiWorkflow = pgTable("AiWorkflow", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  projectId: uuid("projectId").references(() => platformProject.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  nodes: json("nodes").notNull(),
  edges: json("edges").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type AiWorkflow = InferSelectModel<typeof aiWorkflow>;

export const subscription = pgTable("Subscription", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  plan: varchar("plan", { enum: ["starter", "pro", "team"] }).notNull(),
  billingCycle: varchar("billingCycle", {
    enum: ["monthly", "biannual", "yearly"],
  }).notNull(),
  status: varchar("status", {
    enum: ["active", "past_due", "canceled", "incomplete", "trialing"],
  })
    .notNull()
    .default("incomplete"),
  razorpayCustomerId: text("razorpayCustomerId"),
  razorpayOrderId: text("razorpayOrderId").notNull(),
  razorpayPaymentId: text("razorpayPaymentId").notNull(),
  amount: integer("amount").notNull().default(0),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Subscription = InferSelectModel<typeof subscription>;

/**
 * JobMetric — observability table for pipeline runs.
 *
 * One row per pipeline execution (per project, per retry). Used by the
 * observability dashboard to compute success rates, latency percentiles,
 * error-class distribution, and recent failures.
 */
export const jobMetric = pgTable("JobMetric", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  jobType: varchar("jobType", {
    enum: ["pipeline", "crawl", "extract", "validate"],
  }).notNull(),
  projectId: uuid("projectId").references(() => platformProject.id, {
    onDelete: "set null",
  }),
  userId: uuid("userId").references(() => user.id, { onDelete: "set null" }),
  status: varchar("status", {
    enum: ["queued", "running", "success", "failed", "cancelled"],
  }).notNull(),
  attempt: varchar("attempt", { length: 4 }).notNull().default("1"),
  durationMs: varchar("durationMs", { length: 20 }),
  errorClass: varchar("errorClass", { length: 64 }),
  errorMessage: text("errorMessage"),
  traceId: varchar("traceId", { length: 64 }),
  metadata: json("metadata"),
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  finishedAt: timestamp("finishedAt"),
});

export type JobMetric = InferSelectModel<typeof jobMetric>;
