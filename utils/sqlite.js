import SQLite3 from 'sqlite3';
import logger from './logger.js';
import config from '../config.js';

/** @type {SQLite3.Database} */
var instance;

/**
 * Reads single row from database collection
 * @param {string} query
 * @param {any[]} params
 */
export function getRow(query, params = []) {
    return new Promise(function (resolve, reject) {
        instance.get(query, params, function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Reads multiple rows from database collection
 * @param {string} query
 * @param {any[]} params
 */
export function getRows(query, params = []) {
    return new Promise(function (resolve, reject) {
        instance.all(query, params, function (error, rows) {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Insert single row into database collection
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<number>}
 */
export function insertRow(query, params = []) {
    return new Promise(function (resolve, reject) {
        const stmt = instance.prepare(query);

        stmt.run(params, function (error1) {
            if (error1) {
                reject(error1);
            } else {
                const id = this.lastID;

                stmt.finalize(function (error2) {
                    if (error2) {
                        reject(error2);
                    } else {
                        resolve(id);
                    }
                });
            }
        });
    });
}

/**
 * Update single row from database collection
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<number>}
 */
export function updateRow(query, params = []) {
    return new Promise(function (resolve, reject) {
        const stmt = instance.prepare(query);

        stmt.run(params, function (error1) {
            if (error1) {
                reject(error1);
            } else {
                const changes = this.changes;

                stmt.finalize(function (error2) {
                    if (error2) {
                        reject(error2);
                    } else {
                        resolve(changes);
                    }
                });
            }
        });
    });
}

/**
 * Delete single or multiple rows from database collection
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<number>}
 */
export function deleteRow(query, params = []) {
    return new Promise(function (resolve, reject) {
        const stmt = instance.prepare(query);

        stmt.run(params, function (error1) {
            if (error1) {
                reject(error1);
            } else {
                const changes = this.changes;

                stmt.finalize(function (error2) {
                    if (error2) {
                        reject(error2);
                    } else {
                        resolve(changes);
                    }
                });
            }
        });
    });
}

/**
 * Executes given query statement
 * @param {string} query
 * @param {any[]} params
 * @returns {Promise<void>}
 */
export function runStatement(query, params = []) {
    return new Promise(function (resolve, reject) {
        const stmt = instance.prepare(query, function (prepareErr) {
            if (prepareErr) {
                return reject(prepareErr);
            }

            stmt.bind(...params);
            stmt.run(function (runErr) {
                if (runErr) {
                    return reject(runErr);
                }

                stmt.finalize(function (finalizeErr) {
                    if (finalizeErr) {
                        return reject(finalizeErr);
                    }

                    resolve();
                });
            });
        });
    });
}

async function prescript() {
    const queries = {
        CREATE_TABLE_MEDIA: `
            CREATE TABLE IF NOT EXISTS \`media\`(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(100) DEFAULT "New video",
                desc TEXT,
                resolution VARCHAR(10) DEFAULT "0x0",
                status VARCHAR(16) DEFAULT "created",
                public BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );        
        `,
        CREATE_VIEW_MEDIA: `
            CREATE VIEW IF NOT EXISTS \`media_public_view\` AS 
            SELECT id, title, desc, resolution, status, public, STRFTIME('%Y-%m-%dT%H:%M:%SZ', created_at) AS created_at 
            FROM media WHERE public=1 ORDER BY id DESC;
        `,
    };

    for (let queryName in queries) {
        const query = queries[queryName];

        try {
            await runStatement(query);
            logger.log({
                level: 'info',
                label: 'sqlite',
                message: `Preset query executed ${queryName}`,
            });
        } catch (error) {
            logger.log({
                level: 'error',
                label: 'sqlite',
                message: `Failed to execute query ${queryName}`,
            });
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
 * @returns {Promise<void>}
 */
export function openSQLiteDatabase() {
    return new Promise(function (resolve, reject) {
        if (instance) {
            return resolve();
        }

        const dbFile = config.databaseFile;
        instance = new SQLite3.Database(dbFile, async function (err) {
            if (err) {
                logger.log({
                    level: 'error',
                    label: 'sqlite',
                    message: err.message,
                });
                reject(err);
            } else {
                logger.log({
                    level: 'info',
                    label: 'sqlite',
                    message: `Opened ${dbFile}`,
                });

                try {
                    await prescript();
                } catch (error) {
                    return reject(error);
                }

                resolve();
            }
        });
    });
}

/**
 * @returns {Promise<void>}
 */
export function closeSQLiteDatabase() {
    return new Promise(function (resolve, reject) {
        if (instance) {
            instance.close(function (err) {
                if (err) {
                    logger.log({
                        level: 'error',
                        label: 'sqlite',
                        message: err.message,
                    });
                    reject(err);
                } else {
                    logger.log({
                        level: 'info',
                        label: 'sqlite',
                        message: `Closed`,
                    });
                    instance = undefined;
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}
