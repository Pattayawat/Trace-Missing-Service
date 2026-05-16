export const config = {
  env: process.env.NODE_ENV || 'development',
  awsRegion: process.env.AWS_REGION || 'ap-southeast-1',
  db: {
    host: process.env.DB_PROXY_ENDPOINT || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'dbadmin',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'trace_missing',
  },
  redis: {
    host: process.env.REDIS_ENDPOINT || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  aws: {
    s3BucketPhotos: process.env.S3_BUCKET || 'trace-missing-photos-dev',
    eventBusName: process.env.EVENT_BUS_NAME || 'trace-missing-event-bus-dev',
    sqs: {
      faceRecognitionQueue: process.env.FACE_RECOGNITION_QUEUE,
      outboxRelayQueue: process.env.OUTBOX_RELAY_QUEUE,
      matchingJobsQueue: process.env.MATCHING_JOBS_QUEUE,
      inboxEventsQueue: process.env.INBOX_EVENTS_QUEUE,
      integrationRetryQueue: process.env.INTEGRATION_RETRY_QUEUE,
    }
  }
};
