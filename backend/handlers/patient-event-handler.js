import * as reportService from '../services/reportService.js';
import { hospitalClient } from '../utils/hospital-client.js';

console.log('Loading patient-event-handler.js - Dependency Check: hospital-client.js imported');

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
      
      // Support nested 'data' wrapper if present
      const payload = body.data || body;
      
      const source = body.source || body.reported_by || payload.source || payload.reported_by || 'unknown';
      console.log('Processing PatientReported event from:', source);

      // 1. Validation & Schema Normalization
      const hospitalId = payload.destination_hospital_id || payload.destinationHospitalId;
      
      const media = payload.media || {};
      const photoUrl = media.missing_person_photo || media.missingPersonPhoto || 
                       payload.missing_person_photo || payload.missingPersonPhoto || 
                       payload.photo_url || payload.photoUrl;

      if (!photoUrl) {
        console.error('Validation Error: Photo URL is missing. Tried multiple field names (missing_person_photo, missingPersonPhoto, etc.)');
        console.log('Received Message Body:', JSON.stringify(body, null, 2));
        continue;
      }

      if (!isValidUrl(photoUrl)) {
        console.error(`Validation Error: '${photoUrl}' is not a valid URL. Must include protocol (e.g., https:// or s3://)`);
        continue;
      }

      // 2. Data Mapping & Hospital Enrichment
      const chars = payload.characteristics || {};
      const lifeStatus = chars.life_status || chars.lifeStatus || 'ALIVE';
      const reportType = lifeStatus === 'DEAD' ? 'unidentified-deceased' : 'unidentified-victim';
      
      let location = chars.found_location || chars.foundLocation || 'Unknown';
      let lat = payload.lat || payload.latitude || chars.latitude;
      let lon = payload.long || payload.longitude || chars.longitude;

      // NORMALIZE GENDER: Ensure 'ผู้ชาย' / 'male' / 'M' etc map to a stable value for matching
      const rawGender = chars.gender || 'unknown';
      let normalizedGender = rawGender;
      if (rawGender.includes('ชาย') || rawGender.toLowerCase() === 'male' || rawGender.toLowerCase() === 'm') normalizedGender = 'male';
      if (rawGender.includes('หญิง') || rawGender.toLowerCase() === 'female' || rawGender.toLowerCase() === 'f') normalizedGender = 'female';

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
        externalId: body.message_id || body.MessageId || body.traceId || payload.traceId, // Deduplication key
        incidentId: null,
        details: `
Physical Desc: ${chars.physical_desc || chars.physicalDesc || 'N/A'}
Remark: ${chars.physical_remark || chars.physicalRemark || 'N/A'}
Clothes: ${chars.clothes_desc || chars.clothesDesc || 'N/A'}
Job: ${chars.job || 'N/A'}
        `.trim(),
        photoUrl: photoUrl,
        location: location,
        lat: lat,
        long: lon,
        isUnidentified: true,
        source: source === 'unknown' ? 'PreArrivalNotificationService' : source,
        hospitalId: hospitalId,
        ageCategory: chars.age_category || chars.ageCategory,
        gender: normalizedGender, // Use normalized gender for better duplicate detection
        lifeStatus: lifeStatus,
        firstName: chars.first_name || chars.firstName,
        lastName: chars.last_name || chars.lastName,
        reportType: reportType,
        citizenId: payload.citizenId || payload.citizen_id || chars.citizenId || chars.citizen_id || null
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
