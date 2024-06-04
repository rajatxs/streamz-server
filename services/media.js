import { MediaFile } from '../models/MediaFile.js';
import { getRow, insertRow, updateRow } from '../utils/sqlite.js';

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
export async function updateMediaStatus(id, status) {
    return updateRow('UPDATE media SET status=? WHERE id=?;', [status, id]);
}
