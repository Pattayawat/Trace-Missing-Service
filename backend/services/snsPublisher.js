import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from "uuid";

// Initialize the SNS Client
const snsClient = new SNSClient({ region: process.env.AWS_REGION || "us-east-1" });

/**
 * Publishes a SurvivorMatchedEvent to the central SNS Topic.
 * 
 * @param {Object} matchData The payload data conforming to the contract
 * @param {string} [correlationId] Optional correlation ID (generates one if not provided)
 * @returns {Promise<Object>} The response from SNS
 */
export async function publishSurvivorMatchedEvent(matchData, correlationId = null) {
  const topicArn = process.env.SURVIVOR_MATCHED_SNS_TOPIC_ARN;
  if (!topicArn) {
    throw new Error("Missing SURVIVOR_MATCHED_SNS_TOPIC_ARN environment variable");
  }

  // Contract Validation: score >= 0.9 for automatic alert processing
  if (!matchData.match_criteria || matchData.match_criteria.score < 0.9) {
    console.warn(`[SurvivorMatchedEvent] Score is below 0.9 (Score: ${matchData.match_criteria?.score}). Event may not trigger automatic alerts.`);
  }

  // Validate Future Date
  const matchedAt = new Date(matchData.matched_at);
  const now = new Date();
  if (matchedAt > now) {
    throw new Error("matched_at cannot be a future time.");
  }

  const messageId = uuidv4();
  const traceId = correlationId || uuidv4();
  const timestamp = now.toISOString();

  // Validate all required top-level fields are present
  const requiredFields = ['event_id', 'match_id', 'case_id', 'missing_person', 'matched_survivor', 'match_criteria', 'matched_at'];
  for (const field of requiredFields) {
    if (!matchData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const messagePayload = {
    ...matchData
  };

  const publishCommand = new PublishCommand({
    TopicArn: topicArn,
    Message: JSON.stringify(messagePayload),
    MessageAttributes: {
      "x-message-id": {
        DataType: "String",
        StringValue: messageId
      },
      "x-correlation-id": {
        DataType: "String",
        StringValue: traceId
      },
      "x-timestamp": {
        DataType: "String",
        StringValue: timestamp
      },
      "x-version": {
        DataType: "String",
        StringValue: "1.1.0"
      },
      "event_type": {
        DataType: "String",
        StringValue: "SurvivorMatchedEvent"
      }
    }
  });

  try {
    const response = await snsClient.send(publishCommand);
    console.log(`[SNS Publisher] Successfully published SurvivorMatchedEvent (MessageId: ${messageId}, TraceId: ${traceId})`);
    return response;
  } catch (error) {
    console.error(`[SNS Publisher] Failed to publish SurvivorMatchedEvent:`, error);
    throw error;
  }
}
