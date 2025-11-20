import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyPostgres from "@fastify/postgres";
// import postgressConfig from './db/db_config.js'
import orderRouter from "./routes/order.js";
dotenv.config();
import { Server } from "socket.io";
import { setupWs } from "./ws.js";
const fastify = Fastify({
    logger: true,
});
// fastify.register(require("@fastify/cors"), {
//   origin: [process.env.APP_URL],
//   methods: "*",
//   allowedHeaders: ["Content-Type", "Authorization"],
// });
// fastify.register(fastifyPostgres,{
//     connectionString:process.env.DB_URL
// })
fastify.register(orderRouter);
// fastify.register(postgressConfig);
// fastify.get('/',(request,reply)=>{
//     return {
//         msg:"hi there"
//     }
// })
// fastify.post('/',(request,reply)=>{
// })
async function start() {
    const PORT = Number(process.env.PORT) || 4000;
    try {
        await fastify.listen({ port: PORT });
        const io = new Server(fastify.server, {
            cors: {
                origin: "*"
            }
        });
        // console.log(io);
        setupWs(io);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map