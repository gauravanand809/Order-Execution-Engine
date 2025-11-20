import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyPostgres from "@fastify/postgres"; 
import orderRouter from "./routes/order.js";
import websocketPlugin from "@fastify/websocket";

dotenv.config();

const fastify = Fastify({
    logger: true,
});

fastify.register(fastifyPostgres,{
    connectionString:process.env.DB_URL
})

fastify.register(websocketPlugin);
fastify.register(orderRouter);

async function start() {
  const PORT = Number(process.env.PORT) || 4000; 
  try {
    await fastify.listen({ port: PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
