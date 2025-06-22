
import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const HEADER_REQUEST_ID = 'x-request-id';

export interface LogContext {
  transactionId?: string;
  userId?: string;
  correlationId?: string;
  requestId?: string;
  functionName?: string;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }



  private formatLog(level: string, message: string, meta?: any) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      meta,
      service: 'smartpay-orchestrator'
    });
  }

  info(message: string, meta?: any) {
    console.log(this.formatLog('INFO', message, meta));
  }

  error(message: string, error?: Error | any, meta?: any) {
    console.error(this.formatLog('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...meta
    }));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatLog('WARN', message, meta));
  }

  debug(message: string, meta?: any) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatLog('DEBUG', message, meta));
    }
  }

  
  static extractContext(event: APIGatewayProxyEvent): LogContext {
    console.log(event);
    const body = event.body ? JSON.parse(event.body) : {};

    return {
      transactionId: body.transactionId,
      userId: body.userId,
      correlationId: event.headers['x-correlation-id'],
      requestId: uuidv4(),
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME
    };
  }

  time(label: string) {
    const start = Date.now();
    return {
      end: () => {
        const duration = Date.now() - start;
        this.info(`Performance: ${label}`, { duration });
        return duration;
      }
    };
  }

  logRequest(event: APIGatewayProxyEvent) {
    const httpMethod = event.httpMethod;
    const path       = event.path;

    // User‐Agent header may be lowercase in practice
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'] || 'UNKNOWN';

    // Try true Lambda sourceIp, else fall back to X-Forwarded-For or UNKNOWN
    const sourceIp =
      // Lambda proxy v1
      event.requestContext?.identity?.sourceIp
      // Lambda proxy v2
      || (event.requestContext as any)?.http?.sourceIp
      // Typical HTTP header when sitting behind a proxy
      || (event.headers['x-forwarded-for']?.split(',')[0])
      || 'UNKNOWN';

    this.info('Incoming request', { httpMethod, path, userAgent, sourceIp });
  }

  logResponse(statusCode: number, responseTime?: number) {
    this.info('Outgoing response', {
      statusCode,
      responseTime
    });
  }
}

export const logger = new Logger();

export const withLogging = (handler: any) => {
  return async (event: APIGatewayProxyEvent, context: any) => {
    const logContext = Logger.extractContext(event);
    logger.setContext(logContext);
    
    const timer = logger.time('request_duration');
    logger.logRequest(event);

    try {
      const result = await handler(event, context);
      const duration = timer.end();
      logger.logResponse(result.statusCode, duration);
      return result;
    } catch (error) {
      timer.end();
      logger.error('Request failed', error);
      throw error;
    }
  };
};
