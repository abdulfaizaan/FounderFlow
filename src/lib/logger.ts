import * as Sentry from "@sentry/nextjs";

export type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMetadata {
  userId?: string;
  startupId?: string;
  feature?: string;
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel = "info";

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  info(message: string, meta?: LogMetadata) {
    if (this.shouldLog("info")) {
      this.log("INFO", message, meta);
    }
  }

  warn(message: string, meta?: LogMetadata) {
    if (this.shouldLog("warn")) {
      this.log("WARN", message, meta);
    }
  }

  error(message: string, error?: unknown, meta?: LogMetadata) {
    if (this.shouldLog("error")) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log("ERROR", `${message}: ${errorMessage}`, { ...meta, error: errorMessage });

      // Auto-capture critical errors in Sentry
      Sentry.captureException(error || new Error(message));
    }
  }

  debug(message: string, meta?: LogMetadata) {
    if (this.shouldLog("debug")) {
      this.log("DEBUG", message, meta);
    }
  }

  private log(level: string, message: string, meta?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    // In production, this could be sent to a logging service (e.g., Axiom, Datadog)
    // For now, we use structured console output
    console.log(JSON.stringify(logEntry));
  }
}

export const logger = new Logger();
