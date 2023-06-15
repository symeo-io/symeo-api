import { format } from 'winston';
import { config } from '@symeo-sdk';

export class WinstonLogger {
  getLogFormat() {
    let logFormat;
    if (!config.logger.local) {
      logFormat = format.printf((info) =>
        JSON.stringify({
          timestamp: new Date().toDateString(),
          level: info.level,
          message: info.message,
        }),
      );
    } else {
      logFormat = format.combine(
        format.colorize(),
        format.timestamp(),
        format.splat(),
        format.cli(),
      );
    }
    return logFormat;
  }
}
