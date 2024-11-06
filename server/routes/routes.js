import logger from '../../utils/logger.js';
import { handlePing, handleVerification } from '../handlers/handlers.js';
import { postApiRoutes_v1 } from './post.js';
import { userApiRoutes_v1 } from './user.js';

/**
 * Register all API related routes
 * @type {import('fastify').FastifyPluginCallback}
 * @returns {void}
 */
export function apiRoutes(instance, options, done) {
    instance.get(
        '/ping',
        {
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        handlePing,
    );

    instance.route({
        method: 'GET',
        url: '/verify',
        onRequest: instance.basicAuth,
        handler: handleVerification,
    });

    instance.register(postApiRoutes_v1, { prefix: '/v1/post' });
    instance.register(userApiRoutes_v1, { prefix: '/v1/user' });

    logger.log({
        level: 'info',
        label: 'server',
        message: 'Registered API routes',
    });
    done();
}
