import * as reportRepo from '../repositories/reportRepository.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

export const createReport = async (reportData) => {
  const report = await reportRepo.createReport(reportData);
  
  // Trigger async matching job
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

export const listReports = () => reportRepo.getReports();
export const listIncidents = () => reportRepo.getIncidents();
export const getReport = (id) => reportRepo.getReportById(id);
