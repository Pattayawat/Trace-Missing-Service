import { getDbConnection } from '../utils/db.js';
import { publishSurvivorMatchedEvent } from '../services/snsPublisher.js';

export const handler = async (event) => {
  const db = getDbConnection();

  for (const record of event.Records) {
    const payload = JSON.parse(record.body);
    console.log('Processing worker job:', payload);

    // MOCK MATCHING LOGIC
    if (payload.jobType === 'INITIAL_MATCH') {
      const { reportId } = payload;
      
      // Simulate heavy processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const score = Math.random() * 0.5 + 0.5; // Random score between 0.5 and 1.0
      
      const status = score > 0.8 ? 'high_match' : 'manual_review';
      
      try {
        await db.query(
          'INSERT INTO matching_results (person_id, match_score, status, match_method) VALUES ($1, $2, $3, $4)',
          [reportId, score, status, 'mock-ai']
        );
      } catch (err) {
        console.error('Error inserting match result:', err);
      }
      
      console.log(`Matched report ${reportId} with score ${score.toFixed(2)}`);

      // Trigger SNS Publisher if score >= 0.9
      if (score >= 0.9) {
        console.log(`Score is ${score.toFixed(2)} (>= 0.9), publishing SurvivorMatchedEvent...`);
        const mockPayload = {
          event_id: `EVT-MATCH-${Date.now()}`,
          match_id: `MTCH-${Math.floor(Math.random()*10000)}`,
          case_id: reportId, // using reportId as case_id for mock
          missing_person: {
            person_id: reportId,
            first_name: "Mock First",
            last_name: "Mock Last",
            citizen_id: "1234567890123"
          },
          matched_survivor: {
            resident_id: "RES-001",
            shelter_id: "SHELTER-01",
            first_name: "Mock First",
            last_name: "Mock Last",
            citizen_id: "1234567890123",
            location_name: "Mock Shelter"
          },
          match_criteria: {
            method: "RULE_BASED",
            score: parseFloat(score.toFixed(2)),
            matched_fields: ["citizen_id", "first_name", "last_name"]
          },
          matched_at: new Date().toISOString()
        };

        try {
          await publishSurvivorMatchedEvent(mockPayload);
        } catch (publishErr) {
          console.error("Failed to publish to SNS:", publishErr);
        }
      }
    }
  }
};
