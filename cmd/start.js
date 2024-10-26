import { Command } from 'commander';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { startServerInstance, stopServerInstance } from '../server/server.js';
import { openSQLiteDatabase, closeSQLiteDatabase } from '../utils/sqlite.js';
import config from '../config.js';
import logger from '../utils/logger.js';

export const startCommand = new Command('start');

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

startCommand.option('-h, --host <string>', 'server hostname', '127.0.0.1');
startCommand.option('-p, --port <number>', 'server port', '8227');
startCommand.option('-r, --root <string>', 'data root directory', join(homedir(), '.stzdata'));
startCommand.description('start the media server');
startCommand.action(async function (options) {
    process.on('SIGTERM', terminate);
    process.on('SIGINT', terminate);
    config.preset({ rootDir: options.root });

    if (!existsSync(config.dataDir)) {
        await mkdir(config.dataDir, { recursive: true });
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
});
