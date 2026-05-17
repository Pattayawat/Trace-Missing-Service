import * as reportService from '../services/reportService.js';

/**
 * Validates if a string is a properly formatted URL.
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;  
  }
}

/**
 * Lambda handler to process PatientReported events from SQS.
 * This function parses unidentified emergency patient data and creates
 * missing person records in the Trace Missing Service.
 */
export const handler = async (event) => {
  for (const record of event.Records) {
    try {
      const rawMessage = JSON.parse(record.body);
      
      // Handle optional SNS wrapper
      const body = rawMessage.Message ? JSON.parse(rawMessage.Message) : rawMessage;
      
      console.log('Processing PatientReported event from:', body.reported_by || 'unknown');

      // 1. Validation
      if (!body.destination_hospital_id) {
        console.error('Validation Error: destination_hospital_id is missing');
        continue;
      }

      const photoUrl = body.media?.missing_person_photo;
      if (!photoUrl || !isValidUrl(photoUrl)) {
        console.error('Validation Error: missing_person_photo is missing or invalid URL');
        continue;
      }

      // 2. Data Mapping
      const characteristics = body.characteristics || {};
      const lifeStatus = characteristics.life_status || 'ALIVE';
      const reportType = lifeStatus === 'DEAD' ? 'unidentified-deceased' : 'unidentified-victim';
      
      const reportData = {
        userId: 'system-prearrival-service',
        externalId: body.message_id || body.MessageId, // Deduplication key
        incidentId: null,
        details: `
Physical Desc: ${characteristics.physical_desc || 'N/A'}
Remark: ${characteristics.physical_remark || 'N/A'}
Clothes: ${characteristics.clothes_desc || 'N/A'}
Job: ${characteristics.job || 'N/A'}
        `.trim(),
        photoUrl: photoUrl,
        location: characteristics.found_location || 'Unknown',
        isUnidentified: true,
        source: body.reported_by || 'PreArrivalNotificationService',
        hospitalId: body.destination_hospital_id,
        ageCategory: characteristics.age_category,
        gender: characteristics.gender,
        lifeStatus: lifeStatus,
        firstName: characteristics.first_name,
        lastName: characteristics.last_name,
        reportType: reportType
      };

      // 3. Persist Record (with Deduplication)
      const result = await reportService.processPersonMovement(reportData);
      
      console.log(`Successfully processed patient event. Record ID: ${result.id}`);

    } catch (error) {
      console.error('CRITICAL: Failed to process patient event record', {
        error: error instanceof Error ? error.message : error,
        recordId: record.messageId
      });
    }
  }
};
