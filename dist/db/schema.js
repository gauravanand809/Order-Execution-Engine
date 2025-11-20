"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orders = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    orderType: (0, pg_core_1.varchar)("order_type", { enum: ["LIMIT", "MARKET"] }).notNull(),
    inputToken: (0, pg_core_1.varchar)("input_token").notNull(),
    outputToken: (0, pg_core_1.varchar)("output_token").notNull(),
    amountIn: (0, pg_core_1.numeric)("amount_in", { precision: 38, scale: 18 }).notNull(),
    amountOut: (0, pg_core_1.numeric)("amount_out", { precision: 38, scale: 18 }),
    selectedDex: (0, pg_core_1.varchar)("selected_dex"),
    expectedPrice: (0, pg_core_1.numeric)("expected_price", { precision: 38, scale: 18 }),
    executedPrice: (0, pg_core_1.numeric)("executed_price", { precision: 38, scale: 18 }),
    txHash: (0, pg_core_1.varchar)("tx_hash", { length: 66 }),
    status: (0, pg_core_1.varchar)("status", { enum: ["PENDING", "SUCCESS", "FAILED"] }).notNull(),
    errorReason: (0, pg_core_1.text)("error_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map