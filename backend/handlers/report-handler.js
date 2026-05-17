import * as reportService from '../services/reportService.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});

export const handler = async (event) => {
  const { routeKey, pathParameters, body } = event;
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub || 'demo-user';

  try {
    if (routeKey === 'POST /reports') {
      const data = JSON.parse(body);
      const report = await reportService.createReport({ ...data, userId });
      return {
        statusCode: 201,
        body: JSON.stringify(report),
      };
    }

    if (routeKey === 'GET /reports') {
      const reports = await reportService.listReports();
      return {
        statusCode: 200,
        body: JSON.stringify(reports),
      };
    }

    if (routeKey === 'GET /incidents') {
      const incidents = await reportService.listIncidents();
      return {
        statusCode: 200,
        body: JSON.stringify(incidents),
      };
    }

    if (routeKey === 'POST /reports/upload-url') {
      const { fileName, contentType } = JSON.parse(body);
      const key = `uploads/${userId}/${Date.now()}-${fileName}`;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl, key }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not Found' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
