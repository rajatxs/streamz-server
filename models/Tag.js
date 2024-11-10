export class Tag {
    /** @type {string} */
    id = '';

    /** @type {number} */
    postId = NaN;

    /** @type {number} */
    userId = NaN;

    /**
     * Parse row from database row
     * @param {object} row
     * @returns {Tag}
     */
    static fromRow(row) {
        const tag = new Tag();

        tag.id = String(row.id);
        tag.postId = Number(row.post_id);
        tag.userId = Number(row.user_id);
        return tag;
    }
}
