import * as reportRepo from '../repositories/reportRepository.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

export const createReport = async (reportData) => {
  const report = await reportRepo.createReport(reportData);
  
  // Trigger async matching job
  try {
    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.MATCHING_JOBS_QUEUE_URL,
      MessageBody: JSON.stringify({
        jobType: 'INITIAL_MATCH',
        reportId: report.id,
        timestamp: new Date().toISOString()
      })
    }));
  } catch (err) {
    console.error('Failed to queue matching job', err);
  }

  return report;
};

export const listReports = (filters) => reportRepo.getReports(filters);
export const listIncidents = () => reportRepo.getIncidents();
export const listReunifications = () => reportRepo.getReunifications();
export const getReport = (id) => reportRepo.getReportById(id);

export const processPersonMovement = async (data) => {
  // Try to find existing person by external identifier or citizen ID
  let existing = null;
  if (data.externalId) {
    existing = await reportRepo.findReportByExternalId(data.externalId, data.source);
  }
  if (!existing && data.citizenId) {
    existing = await reportRepo.findReportByCitizenId(data.citizenId);
  }

  if (existing) {
    console.log(`Updating movement for existing person: ${existing.id}`);
    return await reportRepo.updateReportLocation(existing.id, {
      location: data.location,
      source: data.source,
      lifeStatus: data.lifeStatus
    });
  }

  // Create new record if not found
  console.log('Creating new record for movement event');
  return await reportRepo.createReport(data);
};

export const matchAndReunify = async (shelterData) => {
  let matched = null;
  
  if (shelterData.citizenId) {
    matched = await reportRepo.findReportByCitizenId(shelterData.citizenId);
  }
  
  if (!matched && shelterData.firstName && shelterData.lastName) {
    matched = await reportRepo.findReportByNames(shelterData.firstName, shelterData.lastName);
  }

  if (matched) {
    console.log(`Match found! Updating reunification for report: ${matched.id}`);
    
    // Update person location
    await reportRepo.updateReportLocation(matched.id, {
      location: `Shelter: ${shelterData.shelterId}`,
      source: 'ShelterService',
      lifeStatus: 'ALIVE'
    });

    // Create/Update reunification status
    return await reportRepo.createReunification({
      reportId: matched.id,
      status: 'MATCHING',
      details: {
        shelterId: shelterData.shelterId,
        rosterId: shelterData.rosterId,
        matchedVia: shelterData.citizenId ? 'citizenId' : 'names'
      }
    });
  }

  console.log('No match found for shelter evacuee');
  return null;
};
