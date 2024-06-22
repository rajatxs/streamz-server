export class Post {
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

    /** @type {number} */
    userId = NaN;

    /** @type {Date} */
    createdAt = new Date();

    /** @type {Date} */
    updatedAt = new Date();

    /**
     * Parse Post from database row
     * @param {object} row
     * @returns {Post}
     */
    static fromRow(row) {
        const mf = new Post();

        mf.id = row.id;
        mf.title = row.title;
        mf.description = row.desc;
        mf.state = row.state;
        mf.public = Boolean(row.public);
        mf.userId = row.user_id;
        mf.createdAt = new Date(row.created_at);
        mf.updatedAt = new Date(row.updated_at);
        return mf;
    }
}
