import logger from '../utils/logger.js';
import { handlePing } from './handlers/handlers.js';
import { handleMediaCreate_v1, handleMediaUpload_v1 } from './handlers/media.js';

/**
 * Registers all root level routes
 * @param {import('fastify').FastifyInstance} instance
 * @returns {void}
 */
export function registerRoutes(instance) {
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

    instance.post(
        '/v1/media',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['title'],
                    additionalProperties: false,
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 5,
                            maxLength: 100,
                        },
                        description: {
                            type: 'string',
                            default: '',
                            maxLength: 5000,
                        },
                        public: {
                            type: 'boolean',
                            default: true,
                        },
                    },
                },
            },
        },
        handleMediaCreate_v1,
    );
    instance.post('/v1/media/:mid/upload', handleMediaUpload_v1);

    logger.log({
        level: 'info',
        label: 'server',
        message: 'Registered defined routes',
    });
}
