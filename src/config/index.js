export const config = {
  env: process.env.NODE_ENV || 'demo',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'dbadmin',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'trace_missing',
  },
  redis: {
    host: process.env.REDIS_ENDPOINT || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  aws: {
    s3BucketPhotos: process.env.S3_BUCKET || 'trace-missing-photos-demo',
    eventBusName: process.env.EVENT_BUS_NAME || 'trace-missing-event-bus-demo',
    sqs: {
      faceRecognitionQueue: process.env.FACE_RECOGNITION_QUEUE,
      outboxRelayQueue: process.env.OUTBOX_RELAY_QUEUE,
      matchingJobsQueue: process.env.MATCHING_JOBS_QUEUE_URL,
      inboxEventsQueue: process.env.INBOX_EVENTS_QUEUE,
      integrationRetryQueue: process.env.INTEGRATION_RETRY_QUEUE,
    }
  }
};
