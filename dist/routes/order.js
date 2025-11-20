import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
const orderSchema = {
    body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
            name: {
                type: "string",
            },
            email: {
                type: "string",
            },
            password: {
                type: "string",
            },
        },
    },
    response: {
        201: {
            type: "object",
            properties: {
                msg: {
                    type: "string",
                },
                id: {
                    type: "string",
                },
                token: {
                    type: "string"
                }
            },
            required: ["id", "msg", "token"],
        },
    },
};
async function orderRouter(fastify, opts) {
    fastify.post("/api/order", { schema: orderSchema }, (request, reply) => {
        const job_id = uuidv4();
        const token = jwt.sign({
            id: job_id,
        }, process.env.AUTH_SECRET || "MeinNahiBatunga");
        reply.code(201);
        return {
            msg: "Job submitted Sucessfully",
            id: job_id,
            token: token
        };
    });
}
export default orderRouter;
//# sourceMappingURL=order.js.map