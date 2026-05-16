import { randomUUID } from 'crypto';
import * as matchController from '../controllers/matchController.js';
import { errorHandler } from '../middlewares/errorHandler.js';

export const handler = async (event) => {
  const correlationId = event.headers?.['X-Correlation-ID'] || event.headers?.['x-correlation-id'] || randomUUID();
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub || 'system';

  try {
    const { requestContext, body } = event;
    const httpMethod = requestContext?.http?.method || event.httpMethod;
    const path = requestContext?.http?.path || event.path;
    const parsedBody = body ? JSON.parse(body) : {};

    const req = {
      body: parsedBody,
      userId,
      correlationId,
      pathParameters: event.pathParameters || {},
      queryStringParameters: event.queryStringParameters || {}
    };

    if (httpMethod === 'POST' && path === '/api/v1/matches/trigger') {
      return await matchController.triggerMatching(req);
    }

    return { statusCode: 404, body: JSON.stringify({ message: 'Route not found' }) };
  } catch (error) {
    return errorHandler(error, correlationId);
  }
};
