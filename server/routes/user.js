import { handleCurrentUserGetInfo_v1 } from '../handlers/user.js';

/**
 * Register all user related API routes
 * @version 1
 * @type {import('fastify').FastifyPluginCallback}
 * @returns {void}
 */
export function userApiRoutes_v1(instance, options, done) {
    instance.route({
        method: 'GET',
        url: '/',
        preHandler: instance.basicAuth,
        handler: handleCurrentUserGetInfo_v1,
    });
    done();
}
