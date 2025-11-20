export default function postgressConfig(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        const client = await fastify.pg.connect();
    });
}
//# sourceMappingURL=db_config.js.map