import { User } from '../models/User.js';
import { getRow, insertRow } from '../utils/sqlite.js';

/**
 * Insert new user record in "users" table
 * @param {Pick<User, 'username'|'name'|'passwordHash'} data
 * @returns {Promise<number>}
 */
export function createUser(data) {
    return insertRow('INSERT INTO users(uname, name, pswd_hash) VALUES (?, ?, ?);', [
        data.username,
        data.name,
        data.passwordHash,
    ]);
}

/**
 * Check if provided username exists in the database or not
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function isUsernameExists(username) {
    const row = await getRow('SELECT COUNT(id) as count FROM users WHERE uname=?;', [username]);
    return row.count > 0;
}
