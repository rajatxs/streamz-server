import {
    handlePostGetList_v1,
    handlePostGet_v1,
    handlePostCreate_v1,
    handlePostUpload_v1,
    handlePostDelete_v1,
} from '../handlers/post.js';

/**
 * Register all post related API routes
 * @version 1
 * @type {import('fastify').FastifyPluginCallback}
 * @returns {void}
 */
export function postApiRoutes_v1(instance, options, done) {
    instance.get('/', handlePostGetList_v1);
    instance.get('/:id', handlePostGet_v1);
    instance.post(
        '/',
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
        handlePostCreate_v1,
    );
    instance.post('/:mid/upload', handlePostUpload_v1);
    instance.delete('/:mid', handlePostDelete_v1);
    done();
}
