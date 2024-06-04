import { join } from 'path';
import Fastify from 'fastify';
import FastifyMultipart from '@fastify/multipart';
import FastifyStatic from '@fastify/static';
import config from '../config.js';
import logger from '../utils/logger.js';
import { registerRoutes } from './routes.js';

/** @type {import('fastify').FastifyInstance} */
var instance;

/**
 * @typedef ServerStartOptions
 * @property {string} host
 * @property {number} port
 */

/**
 * Starts new server instance with provided configuration
 * @param {ServerStartOptions} options
 * @returns {Promise<string>}
 */
export async function startServerInstance(options) {
    /** @type {string} */
    let url;

    if (instance) {
        return;
    }

    instance = Fastify({
        logger: false,
    });


    instance.register(FastifyMultipart, {
        attachFieldsToBody: false,
        limits: {
            files: 1,
            fileSize: 1e9,
        },
    });

    instance.register(FastifyStatic, {
        root: config.mediaDir,
        prefix: '/media/files',
    });

    // instance.addHook('onRequest', function (request, reply, done) {
    //     console.log('new req', request.method, request.routeOptions.url);
    //     done();
    // });

    registerRoutes(instance);

    url = await instance.listen({
        host: options.host,
        port: options.port,
    });

    logger.log({
        level: 'info',
        label: 'server',
        message: `Running at ${url}`,
    });
    return url;
}

/**
 * Stops active server instance
 * @returns {Promise<void>}
 */
export async function stopServerInstance() {
    if (!instance) {
        return;
    }

    await instance.close();
    instance = null;
    logger.log({
        level: 'info',
        label: 'server',
        message: `Stopped`,
    });
}
