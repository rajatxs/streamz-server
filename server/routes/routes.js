import logger from '../../utils/logger.js';
import { handlePing } from '../handlers/handlers.js';
import { mediaApiRoutes_v1 } from './media.js';

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

    instance.register(mediaApiRoutes_v1, { prefix: '/v1/media' });

    logger.log({
        level: 'info',
        label: 'server',
        message: 'Registered API routes',
    });
    done();
}
