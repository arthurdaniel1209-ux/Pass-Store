import crypto from "crypto";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export interface LoggerContext {
  userId?: string | null;
  action?: string;
  requestId?: string;
  traceId?: string;
  ip?: string;
  method?: string;
  url?: string;
  [key: string]: any;
}

// Sensitive environment configuration. We block common secret or PII fields.
const REDACT_KEYS = new Set([
  "password",
  "pass",
  "pwd",
  "token",
  "accesstoken",
  "refreshtoken",
  "auth",
  "authorization",
  "secret",
  "clientsecret",
  "client_secret",
  "key",
  "stripe_secret_key",
  "stripe_key",
  "cvv",
  "cvc",
  "cardnumber",
  "card_number",
  "email",
  "phone",
  "address",
]);

/**
 * Deeply traverses an object to redact sensitive keys and values.
 * Keeps log data safe from leaked credentials/secrets (PCI-DSS & GDPR compliant).
 */
export function redact(val: any): any {
  if (val === null || val === undefined) {
    return val;
  }

  // Handle arrays
  if (Array.isArray(val)) {
    return val.map((item) => redact(item));
  }

  // Handle nested objects
  if (typeof val === "object") {
    const copy: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      const lowerKey = key.toLowerCase();
      // Try exact and tokenized matches
      if (REDACT_KEYS.has(lowerKey) || Array.from(REDACT_KEYS).some(rk => lowerKey.includes(rk))) {
        copy[key] = "[REDACTED]";
      } else {
        copy[key] = redact(val[key]);
      }
    }
    return copy;
  }

  return val;
}

/**
 * Cleanly serializes Error objects to standard fields (since Error is not natively serializable with JSON.stringify).
 */
export function serializeError(error: any): any {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === "object") {
    return redact(error);
  }
  return String(error);
}

/**
 * Class-based JSON Logger built for extreme production-readiness.
 */
export class StructuredLogger {
  private baseContext: LoggerContext;

  constructor(baseContext: LoggerContext = {}) {
    this.baseContext = baseContext;
  }

  /**
   * Derive a child logger with additional context (e.g., per-request tracing context)
   */
  public child(context: LoggerContext): StructuredLogger {
    return new StructuredLogger({
      ...this.baseContext,
      ...context,
    });
  }

  private write(level: LogLevel, message: string, payload?: any, error?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: redact(this.baseContext),
      ...(payload !== undefined ? { details: redact(payload) } : {}),
      ...(error !== undefined ? { error: serializeError(error) } : {}),
    };

    // Output JSON string strictly to stdout/stderr based on logging severity
    const serialized = JSON.stringify(logEntry);
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      process.stderr.write(serialized + "\n");
    } else {
      process.stdout.write(serialized + "\n");
    }
  }

  public info(message: string, payload?: any) {
    this.write(LogLevel.INFO, message, payload);
  }

  public warn(message: string, payload?: any, error?: any) {
    this.write(LogLevel.WARN, message, payload, error);
  }

  public error(message: string, error?: any, payload?: any) {
    this.write(LogLevel.ERROR, message, payload, error);
  }

  public fatal(message: string, error?: any, payload?: any) {
    this.write(LogLevel.FATAL, message, payload, error);
  }
}

// Global default structured logger
export const logger = new StructuredLogger({
  environment: process.env.NODE_ENV || "development",
  service: "pass-streetwear-backend",
});
