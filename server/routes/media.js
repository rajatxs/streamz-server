import {
    handleMediaGetList_v1,
    handleMediaGet_v1,
    handleMediaCreate_v1,
    handleMediaUpload_v1,
    handleMediaDelete_v1,
} from '../handlers/media.js';

/**
 * Register all media related API routes
 * @version 1
 * @type {import('fastify').FastifyPluginCallback}
 * @returns {void}
 */
export function mediaApiRoutes_v1(instance, options, done) {
    instance.get('/', handleMediaGetList_v1);
    instance.get('/:id', handleMediaGet_v1);
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
        handleMediaCreate_v1,
    );
    instance.post('/:mid/upload', handleMediaUpload_v1);
    instance.delete('/:mid', handleMediaDelete_v1);
    done();
}
