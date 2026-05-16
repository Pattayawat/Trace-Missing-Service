import * as personService from '../services/personService.js';
import { validatePersonRegistration } from '../validators/index.js';
import { AppError } from '../middlewares/errorHandler.js';

export const registerPerson = async (req) => {
  const { body, correlationId } = req;
  
  const errors = validatePersonRegistration(body);
  if (errors.length > 0) {
    throw new AppError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  const result = await personService.registerPerson(body, correlationId);
  
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};

export const getPhotoUploadUrl = async (req) => {
  const { pathParameters, correlationId } = req;
  const personId = pathParameters?.id;

  if (!personId) {
    throw new AppError('personId is required', 400);
  }

  const result = await personService.generatePhotoUploadUrl(personId, correlationId);
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};
