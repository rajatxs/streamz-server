import { join, isAbsolute } from 'path';
import { homedir } from 'os';

/**
 * @typedef ConfigPresetOptions
 * @property {string} rootDir - Data root directory
 */

export default {
    /**
     * Default data root directory path
     * @type {string}
     */
    get DEFAULT_DATA_DIR() {
        return join(homedir(), '.stzdata');
    },

    /**
     * Web directory path
     * @type {string} 
     */
    get webDir() {
        return join(import.meta.dirname, 'web');
    },

    /**
     * Data root directory path
     * @type {string}
     */
    get dataDir() {
        return Reflect.get(global.config, 'dataDir');
    },

    /**
     * Database file path
     * @type {string}
     */
    get databaseFile() {
        return Reflect.get(global.config, 'databaseFile');
    },

    /**
     * Media root directory path
     * @type {string}
     */
    get mediaDir() {
        return Reflect.get(global.config, 'mediaDir');
    },

    /**
     * Media thumb directory path
     * @type {string}
     */
    get thumbDir() {
        return Reflect.get(global.config, 'thumbDir');
    },

    /**
     * Media uploads directory path
     * @type {string}
     */
    get uploadDir() {
        return Reflect.get(global.config, 'uploadDir');
    },

    /**
     * @param {ConfigPresetOptions} options
     * @returns {void}
     */
    preset(options) {
        /** @type {string} */
        let dataDir;

        if (!Reflect.has(global, 'config')) {
            Reflect.set(global, 'config', {});
        }

        if (isAbsolute(options.rootDir)) {
            dataDir = options.rootDir;
        } else {
            dataDir = join(process.cwd(), options.rootDir);
        }

        Reflect.set(global.config, 'dataDir', dataDir);
        Reflect.set(global.config, 'databaseFile', join(dataDir, 'stz.db'));
        Reflect.set(global.config, 'mediaDir', join(dataDir, 'media'));
        Reflect.set(global.config, 'thumbDir', join(dataDir, 'thumbs'));
        Reflect.set(global.config, 'uploadDir', join(dataDir, 'uploads'));
    },
};
