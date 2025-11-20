import type { FastifyInstance } from 'fastify';


export default function postgressConfig(fastify:FastifyInstance,opts:object){
    fastify.get('/',async (request,reply)=>{
        const client = await fastify.pg.connect();
        
    })
}