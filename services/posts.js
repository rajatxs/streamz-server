import { Post } from '../models/Post.js';
import { getRow, getRows, insertRow, updateRow, deleteRow } from '../utils/sqlite.js';

/**
 * @param {number} id
 * @returns {Promise<Post>}
 */
export async function getPost(id) {
    const row = await getRow('SELECT * FROM posts_public_view WHERE id=?;', [id]);

    if (!row) {
        return null;
    }
    return Post.fromRow(row);
}

/**
 * @param {Record<string, string|number|boolean>} [options]
 * @returns {Promise<Post[]>}
 */
export async function getPostCollection(options = {}) {
    const rows = await getRows('SELECT * FROM posts_public_view WHERE state=? LIMIT ? OFFSET ?;', [
        options.state,
        options.limit,
        options.offset,
    ]);

    if (Array.isArray(rows)) {
        return rows.map((row) => Post.fromRow(row));
    } else {
        return [];
    }
}

/**
 * @param {string} query
 * @param {Record<string, string|number|boolean>} [options]
 * @returns {Promise<Post[]>}
 */
export async function getPostCollectionByQuery(query, options = {}) {
    const rows = await getRows(
        `SELECT * FROM posts_public_view WHERE title LIKE '%${query}%' OR desc LIKE '%${query}%' AND state=? LIMIT ? OFFSET ?;`,
        [options.state, options.limit, options.offset],
    );

    if (Array.isArray(rows)) {
        return rows.map((row) => Post.fromRow(row));
    } else {
        return [];
    }
}

/**
 * @param {Pick<Post, 'title'|'description'|'public'|'url'|'userId'} data
 * @returns {Promise<number>}
 */
export function createPost(data) {
    return insertRow(
        'INSERT INTO posts(title, desc, public, url, user_id) VALUES (?, ?, ?, ?, ?);',
        [data.title, data.description, Number(data.public), data.url, data.userId],
    );
}

/**
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function isPostExists(id) {
    const row = await getRow('SELECT COUNT(id) as count FROM posts WHERE id=?;', [id]);
    return row.count > 0;
}

/**
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export async function checkPostOwnership(id, userId) {
    const row = await getRow('SELECT COUNT(id) as count FROM posts WHERE id=? AND user_id=?;', [
        id,
        userId,
    ]);
    return row.count > 0;
}

/**
 * @param {number} id
 * @param {string} status
 * @returns {Promise<number>}
 */
export async function updatePostState(id, status) {
    return updateRow('UPDATE posts SET state=? WHERE id=?;', [status, id]);
}

/**
 * @param {number} id
 * @returns {Promise<number>}
 */
export function deletePost(id) {
    return deleteRow('DELETE FROM posts WHERE id=?;', [id]);
}
