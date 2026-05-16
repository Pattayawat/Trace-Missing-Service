import * as reportService from '../services/reportService.js';
import { validateReportCreation } from '../validators/index.js';
import { AppError } from '../middlewares/errorHandler.js';

export const createReport = async (req) => {
  const { body, userId, correlationId } = req;
  
  const errors = validateReportCreation(body);
  if (errors.length > 0) {
    throw new AppError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  const result = await reportService.createMissingReport(body, userId, correlationId);
  
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};
