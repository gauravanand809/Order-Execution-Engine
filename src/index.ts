import Fastify from "fastify";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
dotenv.config();


const fastify = Fastify({
    logger: true,
});

fastify.register(userRouter)
fastify.get('/',(request,reply)=>{
    return {
        msg:"hi there"
    }
})

// fastify.post('/',(request,reply)=>{

// })

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