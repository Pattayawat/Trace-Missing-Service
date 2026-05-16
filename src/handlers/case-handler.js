import { randomUUID } from 'crypto';
import * as caseController from '../controllers/caseController.js';
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

    if (httpMethod === 'PATCH' && path.match(/^\/api\/v1\/cases\/[^\/]+\/status$/)) {
      // API Gateway v2 HTTP APIs might not map path parameters the same way if catch-all route used
      if (!req.pathParameters.id) {
        req.pathParameters.id = path.split('/')[4];
      }
      return await caseController.updateCaseStatus(req);
    }
    // Add other routes here

    return { statusCode: 404, body: JSON.stringify({ message: 'Route not found' }) };
  } catch (error) {
    return errorHandler(error, correlationId);
  }
};
