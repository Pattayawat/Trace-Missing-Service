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
  // 1. Identify ALL records belonging to this person (Regardless of type)
  const allMatches = await reportRepo.findAllMatchingReports(data);
  const targetType = data.reportType || data.report_type || 'unidentified-victim';
  
  let existingTypedRecord = null;

  if (allMatches.length > 0) {
    console.log(`Person found. Syncing location for ${allMatches.length} records.`);
    
    for (const record of allMatches) {
      // Keep track if the specific type (e.g. Survivor) already exists
      if (record.report_type === targetType) {
        existingTypedRecord = record;
      }
      
      // Update location/photo for Unidentified records (Found person context)
      if (record.report_type === 'unidentified-victim' || record.report_type === 'unidentified-deceased') {
        await reportRepo.updateReportLocation(record.id, {
          location: data.location,
          source: data.source,
          lifeStatus: data.lifeStatus,
          lat: data.latitude || data.lat,
          long: data.longitude || data.long,
          photoUrl: data.photoUrl || data.photo_url // Save hospital photo here
        });
      } 
      
      // Update timeline for Missing Person (Family context) - NO OVERWRITE
      if (record.report_type === 'missing-person') {
        if (data.source === 'PreArrivalNotificationService') {
          await updateReportStatus(record.id, 'MATCHING');
        }
        await reportRepo.addCaseEvent(record.id, 'LOCATION_UPDATED', `Missing person seen at ${data.location} (reported via ${data.source})`);
      }
    }
  }

  // 2. If the specific record type (Survivor) doesn't exist, create it (Authoritative creation)
  if (!existingTypedRecord) {
    console.log(`Creating new ${targetType} record as requested by ${data.source}`);
    const newReport = await reportRepo.createReport(data);
    
    // LINKING LOGIC: If a Missing Person was already waiting for this person (e.g. via Shelter)
    // we must link this new record as the 'found' entity to provide the photo.
    const missingPersonRecord = allMatches.find(r => r.report_type === 'missing-person');
    if (missingPersonRecord && newReport.report_type === 'unidentified-victim') {
      await reportRepo.createReunification({
        reportId: missingPersonRecord.id,
        matchedReportId: newReport.id,
        status: 'MATCHING',
        details: { hospitalLinked: true, photoLinked: true }
      });
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
    console.log(`Shelter check-in for Missing Person ${matchedMissing.id}. No survivor record created yet.`);

    // 1. Check if an Unidentified Victim record already exists (e.g. Pre-arrival came first)
    const allMatches = await reportRepo.findAllMatchingReports(shelterData);
    const existingSurvivor = allMatches.find(r => r.report_type === 'unidentified-victim');

    // 2. Update status and timeline of the Missing Person
    await reportRepo.updateReportStatus(matchedMissing.id, 'MATCHING');
    await reportRepo.addCaseEvent(matchedMissing.id, 'SHELTER_CHECKIN', `Checked in at Shelter: ${shelterData.shelterId}`);

    // 3. Create or Update reunification record WITHOUT creating a survivor record.
    // matched_report_id will be NULL if only Shelter has reported, or POINT to the Pre-arrival record if it exists.
    return await reportRepo.createReunification({
      reportId: matchedMissing.id,
      matchedReportId: existingSurvivor ? existingSurvivor.id : null,
      status: 'MATCHING',
      details: {
        shelterId: shelterData.shelterId,
        rosterId: shelterData.rosterId,
        matchedVia: shelterData.citizenId ? 'citizenId' : 'names',
        foundLocation: `Shelter: ${shelterData.shelterId}`,
        lastSeenAt: new Date().toISOString()
      }
    });
  }

  return null;
};
