import { randomUUID } from 'crypto';
import { errorHandler } from '../middlewares/errorHandler.js';

export const handler = async (event) => {
  const correlationId = event.headers?.['X-Correlation-ID'] || event.headers?.['x-correlation-id'] || randomUUID();
  try {
    return { statusCode: 501, body: JSON.stringify({ message: 'Not Implemented' }) };
  } catch (error) {
    return errorHandler(error, correlationId);
  }
};
