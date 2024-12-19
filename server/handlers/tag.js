import { getAllTags, getTagsByPostId, insertTag, deleteTag } from '../../services/tag.js';
import { Tag } from '../../models/Tag.js';
import logger from '../../utils/logger.js';

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleGetAllTagList_v1(request, reply) {
    /** @type {Tag[]} */
    let list = [];

    try {
        list = await getAllTags();
    } catch (error) {
        logger.log({
            level: 'error',
            label: 'handler:get:handleGetAllTagList_v1',
            message: error.message,
        });

        return reply.status(500).send({
            message: 'Failed to get tags',
        });
    }

    return reply.status(200).send({
        message: 'Okay',
        result: list,
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleGetTagList_v1(request, reply) {
    /** @type {string[]} */
    let list = [];

    /** @type {string} */
    const postId = Number(request.params.pid);

    try {
        list = await getTagsByPostId(postId);
    } catch (error) {
        logger.log({
            level: 'error',
            label: 'handler:get:handleGetTagList_v1',
            message: error.message,
        });

        return reply.status(500).send({
            message: 'Failed to get tags',
        });
    }

    return reply.status(200).send({
        message: 'Okay',
        result: list,
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleCreateTag_v1(request, reply) {
    const userId = Number(Reflect.get(request, 'userId'));

    /** @type {number} */
    let insertId;

    /** @type {string} */
    let tag = '';

    if (typeof request.body.tag === 'string') {
        tag = request.body.tag;
    }

    tag = tag.toLocaleLowerCase();
    tag = tag.replace(/\s+/g, '');

    try {
        insertId = await insertTag({
            id: tag,
            postId: request.body.postId,
            userId,
        });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return reply.status(200).send({
                message: 'Tag already added',
                result: { tag },
            });
        } else {
            logger.log({
                level: 'error',
                label: 'handler:post:handleCreateTag_v1',
                message: error.message,
            });

            return reply.status(500).send({
                message: 'Failed to add new tag',
            });
        }
    }

    return reply.status(201).send({
        message: 'Tag saved',
        result: { tag },
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleDeleteTag_v1(request, reply) {
    /** @type {string} */
    let tag = request.params.tid;

    /** @type {number} */
    let postId = Number(request.params.pid);

    try {
        await deleteTag(postId, tag);
    } catch (error) {
        logger.log({
            level: 'error',
            label: 'handler:delete:handleDeleteTag_v1',
            message: error.message,
        });

        return reply.status(500).send({
            message: 'Failed to delete tag',
        });
    }

    return reply.status(200).send({
        message: 'Tag deleted',
    });
}
