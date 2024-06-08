export class MediaFile {
    /** @type {number} */
    id = NaN;

    /** @type {string} */
    title = '';

    /** @type {string} */
    description = '';

    /** @type {string} */
    state = 'created';

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
        mf.description = row.desc;
        mf.state = row.state;
        mf.public = Boolean(row.public);
        mf.createdAt = new Date(row.created_at);
        return mf;
    }
}
