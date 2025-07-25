import SQLite3 from 'better-sqlite3';
import logger from './logger.js';
import config from '../config.js';

/** @type {SQLite3.Database} */
let instance; // Use let instead of var for better scoping

/**
 * Reads single row from database collection
 * @param {string} query
 * @param {any[]} params
 */
export function getRow(query, params = []) {
    return instance.prepare(query).get(params);
}

/**
 * Reads multiple rows from database collection
 * @param {string} query
 * @param {any[]} params
 */
export function getRows(query, params = []) {
    return instance.prepare(query).all(params);
}

/**
 * Insert single row into database collection
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<number>}
 */
export function insertRow(query, params) {
    const stmt = instance.prepare(query);
    const result = stmt.run(...params);
    return result.lastInsertRowid;
}

/**
 * Update single row from database collection
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<number>}
 */
export function updateRow(query, params = []) {
    const stmt = instance.prepare(query);
    const result = stmt.run(params);
    return result.changes;
}

/**
 * Delete single or multiple rows from database collection
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<number>}
 */
export function deleteRow(query, params = []) {
    const stmt = instance.prepare(query);
    const result = stmt.run(params);
    return result.changes;
}

/**
 * Executes given query statement
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<void>}
 */
export function runStatement(query, params = []) {
    const stmt = instance.prepare(query);
    stmt.run(params);
}

function prescript() {
    const queries = {
        CREATE_TABLE_USERS: `
            CREATE TABLE IF NOT EXISTS \`users\` (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uname VARCHAR(12) NOT NULL UNIQUE,
                name VARCHAR(60),
                pswd_hash TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `,
        CREATE_TABLE_POSTS: `
            CREATE TABLE IF NOT EXISTS \`posts\` (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(100) DEFAULT "New post",
                desc TEXT,
                state VARCHAR(12) DEFAULT "created",
                public BOOLEAN DEFAULT 1,
                url TEXT,
                user_id INTEGER REFERENCES users(id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `,
        CREATE_VIEW_USERS: `
            CREATE VIEW IF NOT EXISTS \`users_active_view\` AS 
            SELECT id, uname, name, pswd_hash, active,
            STRFTIME('%Y-%m-%dT%H:%M:%SZ', created_at) AS created_at, 
            STRFTIME('%Y-%m-%dT%H:%M:%SZ', updated_at) AS updated_at 
            FROM users WHERE active=1 ORDER BY id DESC;
        `,
        CREATE_VIEW_POSTS: `
            CREATE VIEW IF NOT EXISTS \`posts_public_view\` AS 
            SELECT id, title, desc, state, public, url, user_id,
            STRFTIME('%Y-%m-%dT%H:%M:%SZ', created_at) AS created_at, 
            STRFTIME('%Y-%m-%dT%H:%M:%SZ', updated_at) AS updated_at 
            FROM posts WHERE public=1 ORDER BY id DESC;
        `,
    };

    for (let queryName in queries) {
        const query = queries[queryName];

        try {
            instance.exec(query);
            logger.log({
                level: 'info',
                label: 'sqlite',
                message: `Preset query executed ${queryName}`,
            });
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'sqlite',
                message: `Failed to execute query ${queryName}: ${error.message}`,
            });
            throw error;
        }
    }
}

/**
 * @returns {SQLite3.Database}
 */
export function sqlite() {
    return instance;
}

/**
 * @param {boolean} setup - Run prescript
 * @returns {Promise<void>}
 */
export async function openSQLiteDatabase(setup = true) {
    if (instance) {
        return;
    }

    const dbFile = config.databaseFile;
    instance = new SQLite3(dbFile);

    try {
        logger.log({
            level: 'info',
            label: 'sqlite',
            message: `Opened ${dbFile}`,
        });

        if (setup) {
            await prescript();
        }
    } catch (error) {
        logger.log({
            level: 'error',
            label: 'sqlite',
            message: error.message,
        });
        throw error;
    }
}

/**
 * @returns {Promise<void>}
 */
export function closeSQLiteDatabase() {
    if (instance) {
        try {
            instance.close();
            logger.log({
                level: 'info',
                label: 'sqlite',
                message: `Closed`,
            });
            instance = undefined;
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'sqlite',
                message: error.message,
            });
            throw error;
        }
    }
}
