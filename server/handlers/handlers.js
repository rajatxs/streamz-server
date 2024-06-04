/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export function handlePing(request, reply) {
    reply.status(200).send({
        message: 'Pong!',
    });
}
