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
}
