export class MediaFile {
    /** @type {number} */
    id = NaN;

    /** @type {string} */
    title = '';

    /** @type {string} */
    description = '';

    /** @type {number[]} */
    resolution = [0, 0];

    /** @type {string} */
    status = 'created';

    /** @type {boolean} */
    public = true;

    /** @type {Date} */
    createdAt = new Date();

    /**
     * Parse MediaFile from database row
     * @param {object} row
     * @returns {MediaFile}
     */
    static fromRow(row) {
        const mf = new MediaFile();

        mf.id = row.id;
        mf.title = row.title;
        mf.desc = row.desc;
        mf.resolution = row.resolution.split('x').map((i) => Number(i));
        mf.status = row.status;
        mf.public = Boolean(row.public);
        mf.createdAt = new Date(row.created_at);
        return mf;
    }
}
