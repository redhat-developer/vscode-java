import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export function initializeLogFile(filename: string) {
	logger.add(new DailyRotateFile({
		filename: filename,
		datePattern: 'YYYY-MM-DD',
		maxSize: '100k', // 100k max size per file
		maxFiles: '2d' // retain logs of the last two days
	}));
}

export const logger = createLogger({
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss.SSS'
		}),
		format.prettyPrint()
	),
	transports: [
		new transports.Console()
	]
});
