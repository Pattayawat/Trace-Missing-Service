export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      message,
      correlationId: process.env.CORRELATION_ID,
      traceId: process.env._X_AMZN_TRACE_ID,
      service: 'trace-missing-service',
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      correlationId: process.env.CORRELATION_ID,
      traceId: process.env._X_AMZN_TRACE_ID,
      service: 'trace-missing-service',
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      message,
      correlationId: process.env.CORRELATION_ID,
      traceId: process.env._X_AMZN_TRACE_ID,
      service: 'trace-missing-service',
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  debug: (message, meta = {}) => {
    if (process.env.LOG_LEVEL === 'DEBUG') {
      console.debug(JSON.stringify({
        level: 'DEBUG',
        message,
        correlationId: process.env.CORRELATION_ID,
        traceId: process.env._X_AMZN_TRACE_ID,
        service: 'trace-missing-service',
        timestamp: new Date().toISOString(),
        ...meta,
      }));
    }
  }
};
