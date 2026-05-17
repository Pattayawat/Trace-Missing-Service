import { getDbConnection } from '../utils/db.js';

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
      
      await db.query(
        'INSERT INTO matching_results (report_id, score, status, details) VALUES ($1, $2, $3, $4)',
        [reportId, score, score > 0.8 ? 'high_match' : 'manual_review', JSON.stringify({ method: 'mock-ai' })]
      );
      
      console.log(`Matched report ${reportId} with score ${score.toFixed(2)}`);
    }
  }
};
