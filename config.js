import { join } from 'path';
import { homedir } from 'os';

export default {
    /**
     * Platform environment
     * @type {'prod'|'dev'}
     */
    get env() {
        return process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
    },

    /**
     * Data root directory path
     * @type {string}
     */
    get dataDir() {
        if (this.env === 'prod') {
            return join(homedir(), '.stzdata');
        } else {
            return join(import.meta.dirname, '.stzdata');
        }
    },

    /**
     * Database file path
     * @type {string}
     */
    get databaseFile() {
        return join(this.dataDir, 'stz.db');
    },

    /**
     * Media root directory path
     * @type {string}
     */
    get mediaDir() {
        return join(this.dataDir, 'media');
    },
};
