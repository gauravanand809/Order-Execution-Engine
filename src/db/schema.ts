import { pgTable, text, varchar, numeric, timestamp, uuid } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderType: varchar("order_type", { enum: ["LIMIT", "MARKET"] }).notNull(),
  inputToken: varchar("input_token").notNull(),
  outputToken: varchar("output_token").notNull(),
  amountIn: numeric("amount_in", { precision: 38, scale: 18 }).notNull(),
  amountOut: numeric("amount_out", { precision: 38, scale: 18 }),
  selectedDex: varchar("selected_dex"),
  expectedPrice: numeric("expected_price", { precision: 38, scale: 18 }),
  executedPrice: numeric("executed_price", { precision: 38, scale: 18 }),
  txHash: varchar("tx_hash", { length: 66 }),
  status: varchar("status", { enum: ["PENDING", "SUCCESS", "FAILED"] }).notNull(),
  errorReason: text("error_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
