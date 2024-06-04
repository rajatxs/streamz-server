import ffmpeg from 'fluent-ffmpeg';

/**
 * @param {string} inputFilePath
 * @param {string} outputFilePath
 * @param {string} resolution
 * @returns {Promise<any>}
 */
export function convertVideoResolution(inputFilePath, outputFilePath, resolution) {
    return new Promise(function (resolve, reject) {
        ffmpeg(inputFilePath)
            .output(outputFilePath)
            .videoCodec('libx264')
            .size(resolution)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
}

/**
 * @param {string} videoFilePath
 * @returns {Promise<{width: number, height: number}>}
 */
export function getVideoResolution(videoFilePath) {
    return new Promise(function (resolve, reject) {
        ffmpeg.ffprobe(videoFilePath, (error, metadata) => {
            if (error) {
                reject(error);
            } else {
                const videoStream = metadata.streams.find(
                    (stream) => stream.codec_type === 'video',
                );

                if (videoStream) {
                    const width = videoStream.width;
                    const height = videoStream.height;

                    resolve({ width, height });
                } else {
                    reject(new Error('No video stream found'));
                }
            }
        });
    });
}

/**
 * @param {string} videoFilePath 
 * @param {string} thumbDir 
 * @returns {Promise<any>}
 */
export function generateVideoThumbnail(videoFilePath, thumbDir) {
    return new Promise(function (resolve, reject) {
        ffmpeg(videoFilePath)
            .screenshots({
                count: 1,
                folder: thumbDir,
                filename: 'thumb.jpg',
                size: '1280x720',
            })
            .on('end', resolve)
            .on('error', reject);
    });
}
