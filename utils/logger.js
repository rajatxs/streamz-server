import winston from 'winston';
import { format } from 'util';

export default winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(function (info) {
            const label = info.label || 'app';
            const level = info.level.toUpperCase();
            return format('%s [%s] %s: %s', info.timestamp, label, level, info.message);
        }),
    ),
    transports: [new winston.transports.Console()],
});
