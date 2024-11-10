import {
    handleGetAllTagList_v1,
    handleGetTagList_v1,
    handleCreateTag_v1,
    handleDeleteTag_v1,
} from '../handlers/tag.js';

/**
 * Register all tag related API routes
 * @version 1
 * @type {import('fastify').FastifyPluginCallback}
 * @returns {void}
 */
export function tagApiRoutes_v1(instance, options, done) {
    instance.route({
        method: 'GET',
        url: '/',
        onRequest: instance.basicAuth,
        handler: handleGetAllTagList_v1,
    });

    instance.route({
        method: 'GET',
        url: '/:pid',
        onRequest: instance.basicAuth,
        handler: handleGetTagList_v1,
    });

    instance.route({
        method: 'POST',
        url: '/',
        schema: {
            body: {
                type: 'object',
                required: ['tag', 'postId'],
                additionalProperties: false,
                properties: {
                    tag: {
                        type: 'string',
                        minLength: 2,
                        maxLength: 50,
                    },
                    postId: {
                        type: 'number',
                        minimum: 1,
                    },
                },
            },
        },
        onRequest: instance.basicAuth,
        handler: handleCreateTag_v1,
    });

    instance.route({
        method: 'DELETE',
        url: '/:tid/:pid',
        onRequest: instance.basicAuth,
        handler: handleDeleteTag_v1,
    });

    done();
}
