#!/usr/bin/env node
import { Command } from 'commander';
import { existsSync, mkdirSync } from 'fs';
import { startServerInstance, stopServerInstance } from './server/server.js';
import { openSQLiteDatabase, closeSQLiteDatabase } from './utils/sqlite.js';
import config from './config.js';
import logger from './utils/logger.js';

const cmd = new Command('rdserver');

async function terminate() {
    try {
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
        const dataDir = config.dataDir;
        const mediaDir = config.mediaDir;

        process.on('SIGTERM', terminate);
        process.on('SIGINT', terminate);

        logger.info(`Running in ${config.env} mode`);

        if (!existsSync(dataDir)) {
            mkdirSync(dataDir);
            logger.info(`Created data directory at ${dataDir}`);
        }

        if (!existsSync(mediaDir)) {
            mkdirSync(mediaDir);
            logger.info(`Created media directory at ${mediaDir}`);
        }

        await openSQLiteDatabase();
        await startServerInstance({
            host: options.host,
            port: Number(options.port),
        });
    });
    cmd.parse();
})();

export { cmd };
