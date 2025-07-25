import { Command } from 'commander';
import { existsSync } from 'fs';
import { genSalt, hash } from 'bcryptjs';
import config from '../config.js';
import { createUser, isUsernameExists } from '../db/user.js';
import { openSQLiteDatabase, closeSQLiteDatabase } from '../lib/sqlite.js';
import logger from '../lib/logger.js';

export const createUserCommand = new Command('create-user');

createUserCommand.description('create a new user');
createUserCommand.argument('username', 'unique username');
createUserCommand.argument('password', 'secure password');
createUserCommand.option('-r, --root <string>', 'data root directory', config.DEFAULT_DATA_DIR);
createUserCommand.action(
    /**
     * @param {string} _username
     * @param {string} _password
     * @param {object} options
     */
    async function (_username, _password, options) {
        /** @type {string} */
        const name = _username;

        /** @type {string} */
        let username;

        /** @type {string} */
        let passwordHash;

        /** @type {number} */
        let userId;

        config.preset({ rootDir: options.root });

        // check for database file
        if (!existsSync(config.databaseFile)) {
            logger.log({
                level: 'error',
                label: 'cmd:create-user',
                message: `Database file not found at ${config.databaseFile}`,
            });
            process.exit(0);
        }

        // generate password hash
        try {
            passwordHash = await hash(_password, await genSalt(10));
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'cmd:create-user',
                message: 'Failed to generate password hash',
            });
            process.exit(1);
        }

        await openSQLiteDatabase(false);

        // simplify username
        username = _username.replace(/[^\w]/g, '').toLowerCase();

        // reduce max length
        if (username.length > 12) {
            username = username.substring(0, 12);
        }

        // check for username availibility
        if (await isUsernameExists(username)) {
            logger.log({
                level: 'error',
                label: 'cmd:create-user',
                message: `Username is already exists "${username}"`,
            });
            await closeSQLiteDatabase();
            process.exit(0);
        }

        // create user entry
        try {
            userId = await createUser({ username, name, passwordHash });
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'cmd:create-user',
                message: error.message,
            });

            process.exit(1);
        }

        logger.log({
            level: 'info',
            label: 'cmd:create-user',
            message: `User created "${username}" id=${userId.toString()}`,
        });

        await closeSQLiteDatabase();
        process.exit(0);
    },
);
