#!/usr/bin/env node
import { Command } from 'commander';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { startServerInstance, stopServerInstance } from './server/server.js';
import { openSQLiteDatabase, closeSQLiteDatabase } from './utils/sqlite.js';
import { startMediaParserService, stopMediaParserService } from './services/media-parser.js';
import config from './config.js';
import logger from './utils/logger.js';

const cmd = new Command('rdserver');

async function terminate() {
    try {
        stopMediaParserService();
        await closeSQLiteDatabase();
        await stopServerInstance();
        process.exit(0);
    } catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
}

(function () {
    cmd.version('0.0.1', '-v, --version');
    cmd.option('-h, --host <string>', 'server hostname', '127.0.0.1');
    cmd.option('-p, --port <number>', 'server port', 8227);
    cmd.description('Streamz media server');

    cmd.action(async function (options) {
        process.on('SIGTERM', terminate);
        process.on('SIGINT', terminate);

        logger.info(`Running in ${config.env} mode`);

        if (!existsSync(config.dataDir)) {
            await mkdir(config.dataDir);
            logger.info(`Created data directory at ${config.dataDir}`);
        }

        if (!existsSync(config.mediaDir)) {
            await mkdir(config.mediaDir);
            logger.info(`Created media directory at ${config.mediaDir}`);
        }

        if (!existsSync(config.uploadDir)) {
            await mkdir(config.uploadDir);
            logger.info(`Created uploads directory at ${config.uploadDir}`);
        }

        await openSQLiteDatabase();
        await startServerInstance({
            host: options.host,
            port: Number(options.port),
        });
        await startMediaParserService();
    });
    cmd.parse();
})();

export { cmd };
