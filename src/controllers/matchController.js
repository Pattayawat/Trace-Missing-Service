import * as matchService from '../services/matchService.js';
import { validateMatchTrigger } from '../validators/index.js';
import { AppError } from '../middlewares/errorHandler.js';

export const triggerMatching = async (req) => {
  const { body, correlationId } = req;
  
  const errors = validateMatchTrigger(body);
  if (errors.length > 0) {
    throw new AppError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  const result = await matchService.triggerMatchingPipeline(body.caseId, body.personId, body.methods, correlationId);
  
  return {
    statusCode: 202,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Matching pipeline triggered', jobId: result.id })
  };
};
