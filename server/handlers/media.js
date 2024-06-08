import util from 'util';
import { join } from 'path';
import { createWriteStream, existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream';
import { fork } from 'child_process';
import config from '../../config.js';
import logger from '../../utils/logger.js';
import {
    getMedia,
    getMediaList,
    createMediaFile,
    mediaExists,
    updateMediaState,
} from '../../services/media.js';

const pump = util.promisify(pipeline);

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleMediaGetList_v1(request, reply) {
    const limit = request.query.limit || 16;
    let list;

    try {
        list = await getMediaList({ limit });
    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to get media list',
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
export async function handleMediaGet_v1(request, reply) {
    const mediaId = Number(request.params.id);

    /** @type {import('../../models/MediaFile.js').MediaFile} */
    let media;

    try {
        media = await getMedia(mediaId);
    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to get media',
        });
    }

    if (!media) {
        return reply.status(404).send({
            message: 'Media not found',
        });
    }

    return reply.status(200).send({
        message: 'Ok',
        result: media,
    });
}

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleMediaCreate_v1(request, reply) {
    /** @type {number} */
    let insertId;

    try {
        insertId = await createMediaFile({
            title: request.body.title,
            description: request.body.description,
            public: request.body.public,
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
export async function handleMediaUpload_v1(request, reply) {
    const mediaId = Number(request.params.mid);
    const data = await request.file();
    const rootDir = config.mediaDir;

    /** @type {string} */
    let videoBucket;

    /** @type {string} */
    let originalVideoFilePath;

    // Allow only mp4 file format
    if (data.mimetype !== 'video/mp4') {
        return reply.status(400).send({
            message: 'Invalid file format',
        });
    }

    // Check media registry
    if ((await mediaExists(mediaId)) === false) {
        return reply.status(404).send({
            message: 'Media not found',
        });
    }

    videoBucket = join(rootDir, mediaId.toString());
    originalVideoFilePath = join(rootDir, mediaId.toString(), '_original.mp4');

    // Create video bucket directory
    if (!existsSync(videoBucket)) {
        await mkdir(videoBucket, { recursive: true });
    }

    // Write video stream
    await pump(data.file, createWriteStream(originalVideoFilePath));
    await updateMediaState(mediaId, 'saved');

    const proc = fork('workers/media-parser', [videoBucket]);

    proc.on('error', function (error) {
        logger.log({
            level: 'error',
            label: 'worker:media-parser',
            message: error.message,
        });
    });

    proc.on('spawn', function () {
        proc.send('preset');
    });

    proc.on('message', async (message) => {
        logger.log({
            level: 'info',
            label: 'worker:media-parser',
            message: `Message received ${message}`,
        });

        if (message === 'preset:done') {
            proc.send('parse');
            await updateMediaState(mediaId, 'parsing');
        } else if (message === 'parse:done') {
            proc.send('done');
            await updateMediaState(mediaId, 'done');
        }
    });

    reply.status(200).send({
        message: 'File saved',
        result: {
            id: mediaId,
        },
    });
}
