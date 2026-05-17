import * as reportRepo from '../repositories/reportRepository.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

export const createReport = async (reportData) => {
  const report = await reportRepo.createReport(reportData);
  
  // 1. If it's a Missing Person, try to match with existing Unidentified Victims
  if (!report.is_unidentified) {
    const potentialMatches = await reportRepo.findPotentialUnidentifiedMatches(report);
    for (const match of potentialMatches) {
      await reportRepo.createReunification({
        reportId: report.id,
        matchedReportId: match.id,
        status: 'MATCHING',
        details: { matchedVia: 'characteristic_similarity', matchType: 'database' }
      });
    }
  } 
  // 2. If it's an Unidentified Victim, try to find the Missing Person
  else {
     // Logic for reverse matching could go here
  }

  // Trigger async matching job (SQS)
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
export const getCaseDetail = (id) => reportRepo.getFullCaseDetail(id);
export const updateReportStatus = async (id, status) => {
  const updated = await reportRepo.updateReportStatus(id, status);
  await reportRepo.addCaseEvent(id, 'STATUS_CHANGED', `Case status manually updated to ${status.toUpperCase()}`);
  return updated;
};

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
    const updated = await reportRepo.updateReportLocation(existing.id, {
      location: data.location,
      source: data.source,
      lifeStatus: data.lifeStatus,
      lat: data.latitude || data.lat,
      long: data.longitude || data.long
    });
    
    // If it's a system update and matched, ensure reunification status is updated
    return updated;
  }

  // Create new record if not found
  console.log('Creating new record for movement event');
  return await createReport(data); // Use the logic above to check for matches
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
      lifeStatus: 'ALIVE',
      lat: shelterData.lat,
      long: shelterData.long
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
