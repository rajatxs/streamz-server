import { Post } from '../models/Post.js';
import { Tag } from '../models/Tag.js';
import { getRow, getRows, insertRow, updateRow, deleteRow } from '../lib/sqlite.js';

/** @returns {Promise<string[]>} */
export async function getAllTags() {
    const rows = await getRows('SELECT DISTINCT id FROM tags;');
    return Array.isArray(rows) ? rows.map((row) => row.id) : [];
}

/**
 * @param {number} postId
 * @returns {Promise<string[]>}
 */
export async function getTagsByPostId(postId) {
    const rows = await getRows('SELECT id FROM tags WHERE post_id=?;', [postId]);
    return Array.isArray(rows) ? rows.map((row) => row.id) : [];
}

/** @param {Pick<Tag, 'id'|'postId'|'userId'>} data */
export async function insertTag(data) {
    await insertRow('INSERT INTO tags(id, post_id, user_id) VALUES (?, ?, ?);', [
        data.id,
        data.postId,
        data.userId,
    ]);
}

/**
 * @param {number} postId
 * @param {string} tag
 */
export async function deleteTag(postId, tag) {
    await deleteRow('DELETE FROM tags WHERE id=? AND post_id=?;', [tag, postId]);
}
