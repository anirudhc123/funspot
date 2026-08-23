type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogContext = Record<string, unknown>;

class Logger {
  private write(level: LogLevel, context: LogContext, message: string) {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: 'funspot-api',
      ...context,
    };

    const output = JSON.stringify(payload);

    switch (level) {
      case 'error':
        console.error(output);
        return;
      case 'warn':
        console.warn(output);
        return;
      case 'debug':
        console.debug(output);
        return;
      default:
        console.log(output);
    }
  }

  info(context: LogContext, message: string) {
    this.write('info', context, message);
  }

  warn(context: LogContext, message: string) {
    this.write('warn', context, message);
  }

  error(context: LogContext, message: string) {
    this.write('error', context, message);
  }

  debug(context: LogContext, message: string) {
    this.write('debug', context, message);
  }
}

export const logger = new Logger();
