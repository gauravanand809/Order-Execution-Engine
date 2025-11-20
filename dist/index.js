"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const postgres_1 = __importDefault(require("@fastify/postgres"));
const order_js_1 = __importDefault(require("./routes/order.js"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: true,
});
fastify.register(postgres_1.default, {
    connectionString: process.env.DB_URL
});
fastify.register(websocket_1.default);
fastify.register(order_js_1.default);
async function start() {
    const PORT = Number(process.env.PORT) || 4000;
    try {
        await fastify.listen({ port: PORT });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map