import * as caseService from '../services/caseService.js';
import { AppError } from '../middlewares/errorHandler.js';

export const updateCaseStatus = async (req) => {
  const { pathParameters, body, correlationId } = req;
  const caseId = pathParameters?.id;
  const status = body?.status;

  if (!caseId || !status) {
    throw new AppError('caseId and status are required', 400);
  }

  const result = await caseService.updateCaseStatus(caseId, status, correlationId);
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};
