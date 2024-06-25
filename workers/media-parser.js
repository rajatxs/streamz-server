import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile, appendFile } from 'fs/promises';
import { execSync, exec } from 'child_process';

/**
 * @typedef MediaScale
 * @property {string} name
 * @property {number} resolution
 * @property {number} bitrate
 * @property {string} path
 */

// Check if a media_dir is provided
if (process.argv.length < 3) {
    console.log(`Error: missing source file and output directory path`);
    process.exit(1);
}

const sourceFile = process.argv[2];
const mediaDir = process.argv[3];
const thumbDir = join(mediaDir, 'thumbs');
const masterPlaylist = join(mediaDir, 'playlist.m3u8');

/** @type {MediaScale[]} */
const mediaScales = [
    {
        name: '1080p',
        resolution: 1080,
        bitrate: 8000,
        path: join(mediaDir, '1080p'),
    },
    {
        name: '720p',
        resolution: 720,
        bitrate: 5000,
        path: join(mediaDir, '720p'),
    },
    {
        name: '480p',
        resolution: 480,
        bitrate: 2500,
        path: join(mediaDir, '480p'),
    },
];

process.on('message', async function (message) {
    switch (message) {
        case 'preset': {
            await preset();
            process.send('preset:done');
            break;
        }
        case 'parse': {
            /** @type {Promise[]} */
            let promises;

            generateThumbnail();
            promises = mediaScales.map(parseVideoResolution);
            await Promise.all(promises);
            process.send('parse:done');
            break;
        }
        case 'done': {
            process.exit(0);
        }
    }
});

/**
 * @returns {Promise<void>}
 */
async function preset() {
    // Check if source file exists
    if (!existsSync(sourceFile)) {
        console.log(`Error: no such source file: ${sourceFile}`);
        process.exit(1);
    }

    // Create media root directory
    await mkdir(mediaDir, { recursive: true });

    // Create thumbnail image directory
    await mkdir(thumbDir, { recursive: true });

    // Create the HLS playlist file
    await writeFile(masterPlaylist, `#EXTM3U\n#EXT-X-VERSION:3\n`);

    // Create video resolution directories
    for (let scale of mediaScales) {
        await mkdir(scale.path, { recursive: true });
    }
}

/**
 * Function to convert video to a specific resolution and bitrate
 * @param {MediaScale} options
 * @returns {Promise<void>}
 */
async function parseVideoResolution(options) {
    return new Promise(function(resolve, reject) {
        process.send(`converting:${options.name}`);
        const playlistFile = join(options.path, 'playlist.m3u8');
        const cmd = `ffmpeg -i "${sourceFile}" -vf "scale=-2:${options.resolution}" -c:v libx264 -b:v ${options.bitrate}k -c:a aac -b:a 128k -preset veryfast -crf 20 -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${options.path}/seg_%03d.ts" "${playlistFile}"`;

        // Create video segments and resolution playlist
        const proc = exec(cmd);

        proc.on('error', function(error) {
            reject(error);
        });

        proc.on('exit', async function(code) {
            // Add resolution to master playlist
            await appendFile(
                masterPlaylist,
                `#EXT-X-STREAM-INF:BANDWIDTH=${options.bitrate * 1000},RESOLUTION=${options.resolution}p\n`,
            );
            await appendFile(masterPlaylist, `${options.resolution}p/playlist.m3u8\n`);
            process.send(`converted:${options.name}`);
            resolve();
        });
    })
}

/**
 * Generate a thumbnail 5 seconds into the video
 * @returns {void}
 */
function generateThumbnail() {
    const cmd = `ffmpeg -i "${sourceFile}" -ss 00:00:05 -vframes 1 -s 1280x720 -q:v 2 "${thumbDir}/thumb_%03d.jpg"`;
    execSync(cmd);
}
