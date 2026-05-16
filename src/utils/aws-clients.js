import { SQSClient } from '@aws-sdk/client-sqs';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { S3Client } from '@aws-sdk/client-s3';
import { SageMakerRuntimeClient } from '@aws-sdk/client-sagemaker-runtime';
import { captureAWSv3Client } from 'aws-xray-sdk';

const awsConfig = { region: process.env.AWS_REGION || 'ap-southeast-1' };

let sqsClient;
let eventBridgeClient;
let s3Client;
let sageMakerClient;

export const getSQSClient = () => {
  if (!sqsClient) {
    sqsClient = process.env.AWS_XRAY_DAEMON_ADDRESS ? captureAWSv3Client(new SQSClient(awsConfig)) : new SQSClient(awsConfig);
  }
  return sqsClient;
};

export const getEventBridgeClient = () => {
  if (!eventBridgeClient) {
    eventBridgeClient = process.env.AWS_XRAY_DAEMON_ADDRESS ? captureAWSv3Client(new EventBridgeClient(awsConfig)) : new EventBridgeClient(awsConfig);
  }
  return eventBridgeClient;
};

export const getS3Client = () => {
  if (!s3Client) {
    s3Client = process.env.AWS_XRAY_DAEMON_ADDRESS ? captureAWSv3Client(new S3Client(awsConfig)) : new S3Client(awsConfig);
  }
  return s3Client;
};

export const getSageMakerClient = () => {
  if (!sageMakerClient) {
    sageMakerClient = process.env.AWS_XRAY_DAEMON_ADDRESS ? captureAWSv3Client(new SageMakerRuntimeClient(awsConfig)) : new SageMakerRuntimeClient(awsConfig);
  }
  return sageMakerClient;
};
