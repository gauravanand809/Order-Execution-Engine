CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_type" varchar NOT NULL,
	"input_token" varchar NOT NULL,
	"output_token" varchar NOT NULL,
	"amount_in" numeric(38, 18) NOT NULL,
	"amount_out" numeric(38, 18),
	"selected_dex" varchar,
	"expected_price" numeric(38, 18),
	"executed_price" numeric(38, 18),
	"tx_hash" varchar(66),
	"status" varchar NOT NULL,
	"error_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
