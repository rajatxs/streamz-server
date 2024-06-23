import util from 'util';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { rename, rm } from 'fs/promises';
import { pipeline } from 'stream';
import logger from '../../utils/logger.js';
import config from '../../config.js';
import {
    getPost,
    getPostCollection,
    createPost,
    checkPostOwnership,
    updatePostState,
    deletePost,
} from '../../services/posts.js';

const pump = util.promisify(pipeline);

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handlePostGetList_v1(request, reply) {
    const limit = request.query.limit || 16;
    const state = request.query.state || 'done';
    let list;

    try {
        list = await getPostCollection({ state, limit });
    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to get posts',
        });
    }

    reply.status(200).send({
        message: 'Ok',
        result: list,
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handlePostGet_v1(request, reply) {
    const postId = Number(request.params.id);

    /** @type {import('../../models/Post.js').Post} */
    let post;

    try {
        post = await getPost(postId);
    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to get post',
        });
    }

    if (!post) {
        return reply.status(404).send({
            message: 'Post not found',
        });
    }

    return reply.status(200).send({
        message: 'Ok',
        result: post,
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handlePostCreate_v1(request, reply) {
    const userId = Number(Reflect.get(request, 'userId'));

    /** @type {number} */
    let insertId;

    try {
        insertId = await createPost({
            title: request.body.title,
            description: request.body.description,
            public: request.body.public,
            userId,
        });
    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to save video metadata',
        });
    }

    reply.status(201).send({
        message: 'Metadata saved',
        result: {
            insertId,
        },
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handlePostUpload_v1(request, reply) {
    const userId = Number(Reflect.get(request, 'userId'));

    // @ts-ignore
    const postId = Number(request.params.mid);
    const data = await request.file();

    // Allow only mp4 file format
    if (data.mimetype !== 'video/mp4') {
        return reply.status(400).send({
            message: 'Invalid file format',
        });
    }

    // Check post registry
    if ((await checkPostOwnership(postId, userId)) === false) {
        return reply.status(404).send({
            message: 'Post not found',
        });
    }

    const tempFilePath = join(config.uploadDir, `_${postId.toString()}.mp4`);
    const filePath = join(config.uploadDir, `${postId.toString()}.mp4`);

    // Write video stream
    await pump(data.file, createWriteStream(tempFilePath));
    await updatePostState(postId, 'saved');
    await rename(tempFilePath, filePath);

    reply.status(200).send({
        message: 'File saved',
        result: {
            id: postId,
        },
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handlePostDelete_v1(request, reply) {
    const userId = Number(Reflect.get(request, 'userId'));

    // @ts-ignore
    const postId = Number(request.params.mid);
    const mediaDir = join(config.mediaDir, postId.toString());

    if ((await checkPostOwnership(postId, userId)) === false) {
        return reply.status(404).send({
            message: 'Post not found',
        });
    }

    try {
        await deletePost(postId);
        await rm(mediaDir, { recursive: true, force: true });
    } catch (error) {
        logger.log({
            level: 'error',
            label: 'handler:post:handlePostDelete_v1',
            message: error.message,
        });
    }

    return reply.status(200).send({
        message: 'Post deleted',
        result: {
            id: postId,
        },
    });
}
