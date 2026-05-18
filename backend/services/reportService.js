import * as reportRepo from '../repositories/reportRepository.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

export const createReport = async (reportData) => {
  // Enforce duplicate check for both Web App and SQS
  const duplicate = await reportRepo.findDuplicateReport(reportData);
  if (duplicate) {
    throw new Error('Duplicate report detected');
  }

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
  const allMatches = await reportRepo.findAllMatchingReports(data);
  const targetType = data.reportType || data.report_type || 'unidentified-victim';
  
  let existingTypedRecord = null;

  if (allMatches.length > 0) {
    for (const record of allMatches) {
      if (record.report_type === targetType) {
        existingTypedRecord = record;
      }
      
      // Update location for Unidentified records
      if (record.report_type === 'unidentified-victim' || record.report_type === 'unidentified-deceased') {
        await reportRepo.updateReportLocation(record.id, {
          location: data.location,
          source: data.source,
          lifeStatus: data.lifeStatus,
          lat: data.latitude || data.lat,
          long: data.longitude || data.long
        });
      } 
      
      // Track event for Missing Person
      if (record.report_type === 'missing-person') {
        if (data.source === 'PreArrivalNotificationService') {
          await updateReportStatus(record.id, 'MATCHING');
        }
        await reportRepo.addCaseEvent(record.id, 'LOCATION_UPDATED', `Person seen at ${data.location} (via ${data.source})`);
      }
    }
  }

  // Create new record (e.g. Hospital reporting for first time)
  if (!existingTypedRecord) {
    const newReport = await reportRepo.createReport(data);
    await reportRepo.addCaseEvent(newReport.id, 'REPORT_CREATED', `Record created via movement event (${data.source})`);
    
    // SMART LINKING: If this is a Survivor record, check if a Reunification already exists for this person (from Shelter)
    // and link this new record as the 'matched_report_id' so the UI gets the photo.
    if (newReport.report_type === 'unidentified-victim') {
      const missingPersonMatch = allMatches.find(r => r.report_type === 'missing-person');
      if (missingPersonMatch) {
        await reportRepo.createReunification({
          reportId: missingPersonMatch.id,
          matchedReportId: newReport.id,
          status: 'MATCHING',
          details: { linkedVia: 'lazy_creation' }
        });
      }
    }
    
    return newReport;
  }

  return existingTypedRecord;
};

export const matchAndReunify = async (shelterData) => {
  let matchedMissing = null;
  
  if (shelterData.citizenId) {
    matchedMissing = await reportRepo.findReportByCitizenId(shelterData.citizenId);
  }
  if (!matchedMissing && shelterData.firstName && shelterData.lastName) {
    matchedMissing = await reportRepo.findReportByNames(shelterData.firstName, shelterData.lastName);
  }

  if (matchedMissing) {
    console.log(`Shelter match found for Missing Person ${matchedMissing.id}. Recording activity only.`);

    // Update Missing Person timeline
    await reportRepo.updateReportStatus(matchedMissing.id, 'MATCHING');
    await reportRepo.addCaseEvent(matchedMissing.id, 'SHELTER_CHECKIN', `Checked in at Shelter: ${shelterData.shelterId}`);

    // Create reunification record WITHOUT a matched_report_id yet (since we don't want to create unidentified record)
    // The Pre-arrival service will link its record here later when it sends data.
    return await reportRepo.createReunification({
      reportId: matchedMissing.id,
      matchedReportId: null, // Keep null as requested: don't create survivor record yet
      status: 'MATCHING',
      details: {
        shelterId: shelterData.shelterId,
        rosterId: shelterData.rosterId,
        matchedVia: shelterData.citizenId ? 'citizenId' : 'names',
        foundLocation: `Shelter: ${shelterData.shelterId}`,
        lastSeenAt: new Date().toISOString(),
        note: 'Verified at shelter, awaiting hospital/pre-arrival details and photo.'
      }
    });
  }

  return null;
};
