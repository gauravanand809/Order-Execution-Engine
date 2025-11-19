const userSchema = {
    body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
            name: {
                type: 'string'
            },
            email: {
                type: 'string'
            },
            password: {
                type: 'string'
            }
        }
    },
    response: { 
        201: {
            type: 'object',
            properties: {
                msg: {
                    type: 'string'
                },
                'id': {
                    type: 'string'
                }
            },
            required: ['id', 'msg']
        }
    }
}

import type { FastifyInstance } from "fastify";
async function userRouter(fastify: FastifyInstance, opts: object) {
    fastify.post("/api/users", { schema: userSchema }, (request, reply) => {
        reply.code(201)
        return {
            msg: "User created successfully",
            id: "unique-user-id-123",
            date:"hi"          
        };
    });
}

export default userRouter;