import * as reportService from '../services/reportService.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});

export const handler = async (event) => {
  const { routeKey, pathParameters, body, queryStringParameters } = event;
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
      const filters = {
        incidentId: queryStringParameters?.incidentId,
        reportType: queryStringParameters?.reportType,
      };
      const reports = await reportService.listReports(filters);
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

    if (routeKey === 'GET /reunifications') {
      const reunifications = await reportService.listReunifications();
      return {
        statusCode: 200,
        body: JSON.stringify(reunifications),
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
      // Construct the public URL for viewing (assuming public read is allowed or using S3 domain)
      const photoUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
      return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl, key, photoUrl }),
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
