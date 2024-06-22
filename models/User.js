export class User {
    /** @type {number} */
    id = NaN;

    /** @type {string} */
    username = '';

    /** @type {string} */
    name = '';

    /** @type {string} */
    passwordHash = '';

    /** @type {boolean} */
    active = true;

    /** @type {Date} */
    createdAt = new Date();

    /** @type {Date} */
    updatedAt = new Date();

    /**
     * Parse User from database row
     * @param {object} row
     * @returns {User}
     */
    static fromRow(row) {
        const user = new User();

        user.id = row.id;
        user.username = row.uname;
        user.name = row.name;
        user.passwordHash = row.pswd_hash;
        user.active = Boolean(row.active);
        user.createdAt = new Date(row.created_at);
        user.updatedAt = new Date(row.updated_at);
        return user;
    }
}
