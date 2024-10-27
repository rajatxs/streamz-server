import {
    handlePostGetList_v1,
    handlePostGet_v1,
    handlePostCreate_v1,
    handlePostUpload_v1,
    handlePostThumbUpload_v1,
    handlePostDelete_v1,
} from '../handlers/post.js';

/**
 * Register all post related API routes
 * @version 1
 * @type {import('fastify').FastifyPluginCallback}
 * @returns {void}
 */
export function postApiRoutes_v1(instance, options, done) {
    instance.route({
        method: 'GET',
        url: '/',
        onRequest: instance.basicAuth,
        handler: handlePostGetList_v1,
    });

    instance.route({
        method: 'GET',
        url: '/:id',
        onRequest: instance.basicAuth,
        handler: handlePostGet_v1,
    });

    instance.route({
        method: 'POST',
        url: '/',
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
                    url: {
                        type: 'string',
                        format: 'url',
                        nullable: true,
                        maxLength: 2048,
                    },
                },
            },
        },
        onRequest: instance.basicAuth,
        handler: handlePostCreate_v1,
    });

    instance.route({
        method: 'POST',
        url: '/:mid/upload',
        onRequest: instance.basicAuth,
        handler: handlePostUpload_v1,
    });

    instance.route({
        method: 'POST',
        url: '/:mid/thumb',
        onRequest: instance.basicAuth,
        handler: handlePostThumbUpload_v1,
    });

    instance.route({
        method: 'DELETE',
        url: '/:mid',
        onRequest: instance.basicAuth,
        handler: handlePostDelete_v1,
    });
    done();
}
