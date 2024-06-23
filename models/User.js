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
     * Parse `User` from database row
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

export class UserPublicInfo {
    /** @type {number} */
    id = NaN;

    /** @type {string} */
    username = '';

    /** @type {string} */
    name = '';

    /**
     * Parse `UserPublicInfo` from database row
     * @param {object} row
     * @returns {UserPublicInfo}
     */
    static fromRow(row) {
        const info = new UserPublicInfo();

        info.id = row.id;
        info.username = row.uname;
        info.name = row.name;
        return info;
    }
}

export class UserCredential {
    /** @type {number} */
    id = NaN;

    /** @type {string} */
    username = '';

    /** @type {string} */
    passwordHash = '';

    /**
     * Parse `UserCredential` from database row
     * @param {object} row
     * @returns {UserCredential}
     */
    static fromRow(row) {
        const cred = new UserCredential();

        cred.id = row.id;
        cred.username = row.uname;
        cred.passwordHash = row.pswd_hash;
        return cred;
    }
}
