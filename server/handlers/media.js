import util from 'util';
import { join } from 'path';
import { createWriteStream, existsSync } from 'fs';
import { rename, mkdir } from 'fs/promises';
import { pipeline } from 'stream';
import config from '../../config.js';
import logger from '../../utils/logger.js';
import { createMediaFile, mediaExists, updateMediaStatus } from '../../services/media.js';
import { getVideoResolution, convertVideoResolution } from '../../services/video.js';

const pump = util.promisify(pipeline);

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

    /** @type {number} */
    let videoWidth;

    /** @type {number} */
    let videoHeight;

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
        await mkdir(videoBucket);
    }

    // Write video stream
    await pump(data.file, createWriteStream(originalVideoFilePath));
    await updateMediaStatus(mediaId, 'uploaded');

    // Get original video resolution
    try {
        const _resolution = await getVideoResolution(originalVideoFilePath);

        videoWidth = _resolution.width;
        videoHeight = _resolution.height;
    } catch (error) {
        logger.log({
            level: 'error',
            label: 'handler:media',
            message: `Failed to get resolution error="${error.message}"`,
        });
        return reply.status(500).send({
            message: 'Failed to get video resolution',
        });
    }

    await updateMediaStatus(mediaId, 'converting');

    // Convert 1080p resolution
    if (videoHeight > 1080 && videoWidth > 1920) {
        try {
            const converted = await convertVideoResolution(
                originalVideoFilePath,
                join(videoBucket, '1080p.mp4'),
                '1920x1080',
            );
            console.log('1080p converted', converted);
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'handler:media',
                message: `Failed to convert 1080p video error="${error.message}"`,
            });
        }
    }

    // Convert 720p resolution
    if (videoHeight > 720 && videoWidth > 1280) {
        try {
            const converted = await convertVideoResolution(
                originalVideoFilePath,
                join(videoBucket, '720p.mp4'),
                '1280x720',
            );
            console.log('720p converted', converted);
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'handler:media',
                message: `Failed to convert 720p video error="${error.message}"`,
            });
        }
    }

    // Convert 480p resolution
    if (videoHeight > 480 && videoWidth > 854) {
        try {
            const converted = await convertVideoResolution(
                originalVideoFilePath,
                join(videoBucket, '480p.mp4'),
                '854x480',
            );
            console.log('480p converted', converted);
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'handler:media',
                message: `Failed to convert 480p video error="${error.message}"`,
            });
        }
    }

    await rename(originalVideoFilePath, join(rootDir, mediaId.toString(), `${videoHeight}.mp4`));
    await updateMediaStatus(mediaId, 'done');

    reply.status(200).send({
        message: 'File saved',
    });
}
