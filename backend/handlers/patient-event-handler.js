import * as reportService from '../services/reportService.js';
import { hospitalClient } from '../utils/hospitalClient.js';

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
 * Enriched with Hospital details via synchronous REST API call.
 */
export const handler = async (event) => {
  for (const record of event.Records) {
    try {
      const rawMessage = JSON.parse(record.body);
      
      // Handle optional SNS wrapper
      const body = rawMessage.Message ? JSON.parse(rawMessage.Message) : rawMessage;
      
      console.log('Processing PatientReported event from:', body.reported_by || 'unknown');

      // 1. Validation
      const hospitalId = body.destination_hospital_id;
      const photoUrl = body.media?.missing_person_photo;

      if (!photoUrl || !isValidUrl(photoUrl)) {
        console.error('Validation Error: missing_person_photo is missing or invalid URL');
        continue;
      }

      // 2. Data Mapping & Hospital Enrichment
      const characteristics = body.characteristics || {};
      const lifeStatus = characteristics.life_status || 'ALIVE';
      const reportType = lifeStatus === 'DEAD' ? 'unidentified-deceased' : 'unidentified-victim';
      
      let location = characteristics.found_location || 'Unknown';
      let lat = body.lat || characteristics.latitude;
      let lon = body.long || characteristics.longitude;

      // ENRICHMENT: Fetch Hospital Details if ID is provided
      if (hospitalId) {
        console.log(`Enriching report with hospital details: ${hospitalId}`);
        const hospital = await hospitalClient.getHospitalById(hospitalId);
        
        if (hospital) {
          // Update location with formal hospital name and address
          location = `${hospital.hospitalName}, ${hospital.address}`;
          lat = hospital.latitude;
          lon = hospital.longitude;
          console.log(`Location enriched: ${location}`);
        }
      }

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
        location: location,
        lat: lat,
        long: lon,
        isUnidentified: true,
        source: body.reported_by || 'PreArrivalNotificationService',
        hospitalId: hospitalId,
        ageCategory: characteristics.age_category,
        gender: characteristics.gender,
        lifeStatus: lifeStatus,
        firstName: characteristics.first_name,
        lastName: characteristics.last_name,
        reportType: reportType
      };

      // 3. Persist Record (with Deduplication and Movement logic)
      const result = await reportService.processPersonMovement(reportData);
      
      console.log(`Successfully processed patient event. Record ID: ${result.id}`);

    } catch (error) {
      console.error('CRITICAL: Failed to process patient event record', {
        error: error.message,
        recordId: record.messageId
      });
    }
  }
};
