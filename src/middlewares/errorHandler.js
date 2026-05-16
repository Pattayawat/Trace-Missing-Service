import { logger } from '../utils/logger.js';

export const errorHandler = (err, correlationId) => {
  logger.error('Unhandled Exception', { error: err.message, stack: err.stack, correlationId });

  if (err.statusCode) {
    return {
      statusCode: err.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message, correlationId })
    };
  }

  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Internal Server Error', correlationId })
  };
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
