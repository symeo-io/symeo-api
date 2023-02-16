import { format } from 'winston';
import tracer from 'dd-trace';
import { formats } from 'dd-trace/ext';
import { config } from 'symeo-js/config';

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

    const span = tracer.scope().active();

    if (span) {
      tracer.inject(span.context(), formats.LOG, logFormat);
    }

    return logFormat;
  }
}
