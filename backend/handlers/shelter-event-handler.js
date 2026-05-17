import * as reportService from '../services/reportService.js';

/**
 * Lambda handler to process EvacueeCheckedIn events from the Shelter Service.
 * This function tries to match evacuees with missing person reports.
 */
export const handler = async (event) => {
  for (const record of event.Records) {
    try {
      const rawMessage = JSON.parse(record.body);
      
      // Shelter Service messages are SNS-wrapped
      const innerMessage = rawMessage.Message ? JSON.parse(rawMessage.Message) : rawMessage;
      
      if (innerMessage.eventType !== 'EvacueeCheckedIn') {
        console.log(`Skipping event type: ${innerMessage.eventType}`);
        continue;
      }

      const data = innerMessage.data || {};
      
      console.log('Processing Shelter Check-in for:', {
        citizenId: data.citizenId,
        firstName: data.firstName,
        lastName: data.lastName
      });

      // 1. Perform Matching and Update Reunification Status
      const result = await reportService.matchAndReunify({
        citizenId: data.citizenId,
        firstName: data.firstName,
        lastName: data.lastName,
        shelterId: data.shelterId,
        rosterId: data.rosterId,
        lat: data.lat,
        long: data.long
      });

      if (result) {
        console.log(`Match success! Reunification record updated.`);
      } else {
        console.log(`No active missing person report found for this evacuee.`);
      }

    } catch (error) {
      console.error('CRITICAL: Failed to process shelter event record', {
        error: error instanceof Error ? error.message : error,
        recordId: record.messageId
      });
    }
  }
};
