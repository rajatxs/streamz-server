import { getUserCredentialByUsername } from '../../db/user.js';

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export function handlePing(request, reply) {
    reply.status(200).send({
        message: 'Pong!',
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export function handleVerification(request, reply) {
    return reply.status(200).send({
        message: 'Ok',
    });
}
