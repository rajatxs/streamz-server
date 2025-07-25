import Fastify from 'fastify';
import FastifyMultipart from '@fastify/multipart';
import FastifyStatic from '@fastify/static';
import FastifyCORS from '@fastify/cors';
import FastifyBasicAuth from '@fastify/basic-auth';
import FastifyRequestContext from '@fastify/request-context';
import config from '../config.js';
import logger from '../utils/logger.js';
import { requestValidator } from './handlers/auth.js';
import { apiRoutes } from './routes/routes.js';

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

    instance.register(FastifyCORS, {
        origin: '*',
        allowedHeaders: [
            'Accept',
            'Content-Type',
            'Authorization',
            'X-Api-Key',
            'X-User-Id',
            'X-Request-Id',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS', 'DELETE'],
    });
    instance.register(FastifyMultipart, {
        attachFieldsToBody: false,
        limits: {
            files: 1,
            fileSize: 1e9,
        },
    });
    instance.register(FastifyStatic, {
        root: config.webDir,
        prefix: '/',
    });
    instance.register(FastifyStatic, {
        root: config.mediaDir,
        prefix: '/media/files',
        decorateReply: false,
    });
    instance.register(FastifyStatic, {
        root: config.thumbDir,
        prefix: '/media/thumbs',
        decorateReply: false,
    });
    instance.register(FastifyBasicAuth, {
        validate: requestValidator,
    });

    instance.register(FastifyRequestContext, {
        hook: 'preValidation',
        defaultStoreValues: {},
    });

    instance.register(apiRoutes, { prefix: '/api' });

    instance.addHook('preHandler', function (request, reply, done) {
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 25;
        const offset = (page - 1) * limit;

        request.requestContext.set('pageIndex', page);
        request.requestContext.set('pageLimit', limit);
        request.requestContext.set('pageOffset', offset);
        request.requestContext.set('userId', NaN);
        done();
    });

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
