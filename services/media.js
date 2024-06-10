import { MediaFile } from '../models/MediaFile.js';
import { getRow, getRows, insertRow, updateRow, deleteRow } from '../utils/sqlite.js';

/**
 * @param {number} id
 * @returns {Promise<MediaFile>}
 */
export async function getMedia(id) {
    const row = await getRow('SELECT * FROM media_public_view WHERE id=?;', [id]);

    if (!row) {
        return null;
    }
    return MediaFile.fromRow(row);
}

/**
 * @param {Record<string, string|number|boolean>} [options]
 * @returns {Promise<MediaFile[]>}
 */
export async function getMediaList(options = {}) {
    const rows = await getRows('SELECT * FROM media_public_view WHERE state=? LIMIT ?', [
        options.state,
        options.limit,
    ]);

    if (Array.isArray(rows)) {
        return rows.map((row) => MediaFile.fromRow(row));
    } else {
        return [];
    }
}

/**
 * @param {string} state
 * @param {limit} limit
 * @returns {Promise<number[]>}
 */
export async function getMediaIds(state = 'done', limit = 5) {
    const rows = await getRows('SELECT id FROM media_public_view WHERE state=? LIMIT ?', [
        state,
        limit,
    ]);

    if (Array.isArray(rows)) {
        return rows.map((row) => row.id);
    } else {
        return [];
    }
}

/**
 * Insert new media file record
 * @param {Pick<MediaFile, 'title'|'description'|'public'} data
 * @returns {Promise<number>}
 */
export function createMediaFile(data) {
    return insertRow('INSERT INTO media(title, desc, public) VALUES (?, ?, ?);', [
        data.title,
        data.description,
        data.public,
    ]);
}

/**
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function mediaExists(id) {
    const row = await getRow('SELECT COUNT(id) as count FROM media WHERE id=?;', [id]);
    return row.count > 0;
}

/**
 * @param {number} id
 * @param {string} status
 * @returns {Promise<number>}
 */
export async function updateMediaState(id, status) {
    return updateRow('UPDATE media SET state=? WHERE id=?;', [status, id]);
}

/**
 * @param {number} id
 * @returns {Promise<number>}
 */
export function deleteMedia(id) {
    return deleteRow("DELETE FROM media WHERE id=?;", id);
}
