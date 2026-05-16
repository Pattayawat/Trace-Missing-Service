export const validateReportCreation = (body) => {
  const errors = [];
  if (!body.incidentId) errors.push('incidentId is required');
  if (!body.details) errors.push('details is required');
  return errors;
};

export const validatePersonRegistration = (body) => {
  const errors = [];
  if (!body.caseId) errors.push('caseId is required');
  if (!body.fullName) errors.push('fullName is required');
  return errors;
};

export const validateMatchTrigger = (body) => {
  const errors = [];
  if (!body.caseId) errors.push('caseId is required');
  if (!body.personId) errors.push('personId is required');
  if (!body.methods || !Array.isArray(body.methods)) errors.push('methods must be an array');
  return errors;
};
