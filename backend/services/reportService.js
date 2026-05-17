import * as reportRepo from '../repositories/reportRepository.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

export const createReport = async (reportData) => {
  const report = await reportRepo.createReport(reportData);
  await reportRepo.addCaseEvent(report.id, 'REPORT_CREATED', 'Missing person report created in system');
  
  // 1. If it's a Missing Person, try to match with existing Unidentified Victims
  if (!report.is_unidentified) {
    const potentialMatches = await reportRepo.findPotentialUnidentifiedMatches(report);
    if (potentialMatches.length > 0) {
      console.log(`Found ${potentialMatches.length} internal matches for new report: ${report.id}`);
      
      // Update status to MATCHING
      await reportRepo.updateReportStatus(report.id, 'MATCHING');
      await reportRepo.addCaseEvent(report.id, 'MATCH_DETECTED', `Found ${potentialMatches.length} potential matches in unidentified reports database`);

      for (const match of potentialMatches) {
        await reportRepo.createReunification({
          reportId: report.id,
          matchedReportId: match.id,
          status: 'MATCHING',
          details: { matchedVia: 'characteristic_similarity', matchType: 'database' }
        });
      }
    }
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
export const getStats = (incidentId) => reportRepo.getSystemStats(incidentId);

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
    
    await reportRepo.addCaseEvent(existing.id, 'LOCATION_UPDATED', `Person location updated to ${data.location} via ${data.source}`);
    
    // Auto-transition to MATCHING if moved via Pre-Arrival (Hospital)
    if (data.source === 'PreArrivalNotificationService' && (existing.status === 'REPORTED' || existing.status === 'ACTIVE' || existing.status === 'missing')) {
      await updateReportStatus(existing.id, 'MATCHING');
    }

    return updated;
  }

  // Create new record if not found
  console.log('Creating new record for movement event');
  const newReport = await createReport(data);
  return newReport;
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
    
    // 1. Update person location and status
    await reportRepo.updateReportLocation(matched.id, {
      location: `Shelter: ${shelterData.shelterId}`,
      source: 'ShelterService',
      lifeStatus: 'ALIVE',
      lat: shelterData.lat,
      long: shelterData.long
    });

    await reportRepo.updateReportStatus(matched.id, 'MATCHING');
    await reportRepo.addCaseEvent(matched.id, 'MATCH_DETECTED', `Potential match found at Shelter ${shelterData.shelterId} (Shelter Service Check-in)`);

    // 2. Create/Update reunification status
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
