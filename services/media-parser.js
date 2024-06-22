import { join } from 'path';
import { readdirSync } from 'fs';
import { unlink, rename } from 'fs/promises';
import { fork } from 'child_process';
import config from '../config.js';
import logger from '../utils/logger.js';
import { updatePostState } from './posts.js';

/**
 * @typedef MediaObject
 * @property {number} id
 * @property {string} filename
 */

/** @type {MediaObject[]} */
var queue = [];

/** @type {boolean} */
var parsing = false;

/** @type {NodeJS.Timeout} */
var timer;

async function execute() {
    if (parsing) {
        return;
    }

    if (!queue.length) {
        const files = readdirSync(config.uploadDir);

        if (Array.isArray(files) && files.length > 0) {
            queue = files
                .filter(function (file) {
                    // Avoid unresolved files
                    return !file.startsWith('_');
                })
                .map(function (file) {
                    const [filename] = file.split('.');

                    return {
                        id: Number(filename),
                        filename: file,
                    };
                });
        }
    }

    if (queue.length > 0) {
        parse(queue.shift());
    }
}

export async function startMediaParserService() {
    timer = setInterval(execute, 3000);
}

export function stopMediaParserService() {
    if (timer) {
        queue = [];
        parsing = false;
        clearInterval(timer);
        timer = null;
    }
}

/** @param {MediaObject} param */
function parse(param) {
    const sourceFile = join(config.uploadDir, param.filename);
    const mediaBucket = join(config.mediaDir, param.id.toString());
    const proc = fork('workers/media-parser', [sourceFile, mediaBucket]);

    proc.on('error', async function (error) {
        logger.log({
            level: 'error',
            label: 'worker:media-parser',
            message: error.message,
        });
    });

    proc.on('exit', async function (code) {
        if (code === 0) {
            logger.log({
                level: 'info',
                label: 'worker:media-parser',
                message: `Parsing done for media ${param.id}`,
            });

            await updatePostState(param.id, 'done');

            // Remove resolved source file
            await unlink(sourceFile);
        } else {
            logger.log({
                level: 'error',
                label: 'worker:media-parser',
                message: `Failed to parse media ${param.id}`,
            });

            await updatePostState(param.id, 'parse_error');

            // Keep unresolved source file by different filename prefix
            await rename(sourceFile, join(config.uploadDir, `_${param.filename}`));
        }
    });

    proc.on('spawn', function () {
        parsing = true;
        proc.send('preset');
    });

    proc.on('disconnect', function () {
        parsing = false;
    });

    proc.on('message', async (message) => {
        logger.log({
            level: 'info',
            label: 'worker:media-parser',
            message: `Message received ${message}`,
        });

        if (message === 'preset:done') {
            proc.send('parse');
            await updatePostState(param.id, 'parsing');
        } else if (message === 'parse:done') {
            proc.send('done');
        }
    });
}
