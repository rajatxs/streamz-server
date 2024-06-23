import { User, UserPublicInfo, UserCredential } from '../models/User.js';
import { getRow, insertRow } from '../utils/sqlite.js';

/**
 * @param {number} id
 * @returns {Promise<UserPublicInfo|null>}
 */
export function getUserInfo(id) {
    const row = getRow('SELECT id, uname, name FROM users_active_view WHERE id=?;', [id]);

    if (!row) {
        return null;
    }
    return UserPublicInfo.fromRow(row);
}

/**
 * @param {string} username
 * @returns {Promise<UserCredential|null>}
 */
export async function getUserCredentialByUsername(username) {
    const row = await getRow('SELECT id, uname, pswd_hash FROM users_active_view WHERE uname=?;', [
        username,
    ]);

    if (!row) {
        return null;
    }
    return UserCredential.fromRow(row);
}

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
    const row = await getRow('SELECT COUNT(id) as count FROM users_active_view WHERE uname=?;', [
        username,
    ]);
    return row.count > 0;
}
