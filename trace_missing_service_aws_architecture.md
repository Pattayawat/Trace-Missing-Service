# Trace-Missing-Service — AWS Architecture
## Lambda + SQS Implementation Guide

> **Stack:** AWS Lambda · SQS · API Gateway · RDS PostgreSQL · ElastiCache Redis · S3 · EventBridge

---

## 1. ภาพรวม AWS Architecture

```
                        ┌────────────────────────────────────────────────┐
                        │              AWS Cloud                         │
                        │                                                │
   Client / Frontend ──►│  API Gateway (HTTP API)                        │
                        │    • JWT Authorizer (Cognito / Lambda)         │
                        │    • Rate Limiting (Usage Plans)               │
                        │    • X-Correlation-ID injection                │
                        │         │                                      │
                        │         ▼                                      │
                        │  ┌─────────────────────────────────────────┐  │
                        │  │         Lambda Functions (API Layer)     │  │
                        │  │  report-handler · case-handler           │  │
                        │  │  person-handler · match-handler          │  │
                        │  │  verification-handler · analytics-handler│  │
                        │  └──────┬────────────────────┬─────────────┘  │
                        │         │                    │                 │
                        │         ▼                    ▼                 │
                        │  ┌────────────┐    ┌────────────────────┐     │
                        │  │  RDS Aurora│    │  SQS Queues        │     │
                        │  │  PostgreSQL│    │  (Event Bus)       │     │
                        │  │  (Primary +│    │                    │     │
                        │  │  Replicas) │    │                    │     │
                        │  └────────────┘    └────────────────────┘     │
                        │                            │                  │
                        │         ┌──────────────────┼──────────────────┤
                        │         ▼                  ▼                  │
                        │  ┌──────────────┐  ┌──────────────────────┐  │
                        │  │ ElastiCache  │  │  Lambda Workers       │  │
                        │  │   Redis      │  │  (Async Processing)  │  │
                        │  └──────────────┘  └──────────────────────┘  │
                        │                                                │
                        │  ┌──────────────┐  ┌──────────────────────┐  │
                        │  │  S3 Bucket   │  │  EventBridge          │  │
                        │  │  (Photos)    │  │  (Cross-service bus) │  │
                        │  └──────────────┘  └──────────────────────┘  │
                        └────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             Incident Service  Shelter Service  Notification Service
```

---

## 2. Lambda Functions — แยกตาม Domain Module

### 2.1 API Handler Lambdas (Triggered by API Gateway)

| Lambda Function | Endpoint Group | Memory | Timeout |
|---|---|---|---|
| `report-handler` | `POST/GET/PATCH /api/v1/reports` | 512 MB | 30s |
| `case-handler` | `/api/v1/cases/**` | 512 MB | 30s |
| `person-handler` | `/api/v1/persons/**` | 512 MB | 30s |
| `match-handler` | `/api/v1/matches/**` | 512 MB | 30s |
| `verification-handler` | `/api/v1/verifications/**` | 512 MB | 30s |
| `analytics-handler` | `/api/v1/analytics/**` | 512 MB | 60s |
| `internal-handler` | `/internal/v1/**` | 256 MB | 30s |

**ตัวอย่าง report-handler:**
```javascript
// handlers/report-handler.js
export const handler = async (event) => {
  const { httpMethod, path, body, requestContext } = event;
  const userId = requestContext.authorizer?.claims?.sub;
  const correlationId = event.headers['X-Correlation-ID'] ?? randomUUID();

  // Route to use case
  if (httpMethod === 'POST' && path === '/api/v1/reports') {
    return await createReport({ body: JSON.parse(body), userId, correlationId });
  }
  // ...
};

async function createReport({ body, userId, correlationId }) {
  const client = await getDbConnection(); // RDS Proxy connection
  
  try {
    await client.query('BEGIN');
    
    // 1. Insert missing_report
    const report = await client.query(INSERT_REPORT_SQL, [body.reporterId, body.incidentId, ...]);
    
    // 2. Auto-create case
    const caseRecord = await client.query(INSERT_CASE_SQL, [report.rows[0].id, ...]);
    
    // 3. Write outbox event (Transactional Outbox Pattern)
    await client.query(INSERT_OUTBOX_SQL, [
      'missing_reports', report.rows[0].id,
      'missing.report.created',
      JSON.stringify({ reportId: report.rows[0].id, caseId: caseRecord.rows[0].id }),
      correlationId
    ]);
    
    await client.query('COMMIT');
    
    return { statusCode: 201, body: JSON.stringify({ reportId: report.rows[0].id }) };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}
```

### 2.2 Worker Lambdas (Triggered by SQS)

| Lambda Function | SQS Queue | หน้าที่ | Memory | Timeout |
|---|---|---|---|---|
| `outbox-relay-worker` | `outbox-relay-queue` | อ่าน outbox_events → publish ไป EventBridge | 256 MB | 60s |
| `inbox-consumer-worker` | `inbox-events-queue` | รับ events จาก External Services | 256 MB | 60s |
| `matching-orchestrator` | `matching-jobs-queue` | จัดการ matching workflow | 1 GB | 300s |
| `face-recognition-worker` | `face-recognition-queue` | Face embedding (ใช้ EFS + ML model) | 3 GB | 300s |
| `integration-retry-worker` | `integration-retry-queue` | Retry failed external API calls | 256 MB | 60s |
| `shelter-sync-worker` | `shelter-sync-queue` | Sync shelter cache | 512 MB | 120s |
| `cache-eviction-worker` | `cache-eviction-queue` | TTL cleanup สำหรับ shelter_person_cache | 256 MB | 60s |

---

## 3. SQS Queues — โครงสร้างทั้งหมด

### 3.1 Queue Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        SQS Queues                               │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │  outbox-relay-queue │    │  outbox-relay-dlq           │    │
│  │  (Standard)         │───►│  (Dead Letter Queue)        │    │
│  │  Visibility: 30s    │    │  maxReceiveCount: 3         │    │
│  └─────────────────────┘    └─────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │  inbox-events-queue │    │  inbox-events-dlq           │    │
│  │  (Standard)         │───►│  maxReceiveCount: 3         │    │
│  │  Visibility: 30s    │    └─────────────────────────────┘    │
│  └─────────────────────┘                                        │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │  matching-jobs-queue│    │  matching-jobs-dlq          │    │
│  │  (Standard)         │───►│  maxReceiveCount: 2         │    │
│  │  Visibility: 300s   │    └─────────────────────────────┘    │
│  └─────────────────────┘                                        │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │ face-recognition-q  │    │  face-recognition-dlq       │    │
│  │  (Standard)         │───►│  maxReceiveCount: 2         │    │
│  │  Visibility: 300s   │    └─────────────────────────────┘    │
│  └─────────────────────┘                                        │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │ integration-retry-q │    │  integration-retry-dlq      │    │
│  │  (FIFO)             │───►│  maxReceiveCount: 5         │    │
│  │  Visibility: 60s    │    └─────────────────────────────┘    │
│  └─────────────────────┘                                        │
│                                                                 │
│  ┌─────────────────────┐                                        │
│  │  shelter-sync-queue │                                        │
│  │  (Standard)         │                                        │
│  │  Visibility: 120s   │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Queue Configuration (Terraform)

```hcl
# outbox-relay-queue
resource "aws_sqs_queue" "outbox_relay" {
  name                       = "trace-missing-outbox-relay"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400   # 1 day
  receive_wait_time_seconds  = 20      # Long polling
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.outbox_relay_dlq.arn
    maxReceiveCount     = 3
  })

  tags = { Service = "trace-missing" }
}

resource "aws_sqs_queue" "outbox_relay_dlq" {
  name                      = "trace-missing-outbox-relay-dlq"
  message_retention_seconds = 1209600  # 14 days
}

# matching-jobs-queue (longer visibility for heavy processing)
resource "aws_sqs_queue" "matching_jobs" {
  name                       = "trace-missing-matching-jobs"
  visibility_timeout_seconds = 300     # 5 min (matching อาจใช้เวลานาน)
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.matching_jobs_dlq.arn
    maxReceiveCount     = 2
  })
}

# integration-retry-queue (FIFO เพื่อรักษาลำดับ)
resource "aws_sqs_queue" "integration_retry" {
  name                        = "trace-missing-integration-retry.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 60
  message_retention_seconds   = 345600  # 4 days
}
```

---

## 4. Outbox Pattern บน AWS

### 4.1 Flow

```
Lambda (API Handler)
       │
       ├── BEGIN transaction
       ├── INSERT INTO missing_reports
       ├── INSERT INTO outbox_events  ← key step
       └── COMMIT
              │
              │ (polling ทุก 500ms หรือ trigger by EventBridge Scheduler)
              ▼
outbox-relay-worker Lambda
       │
       ├── SELECT * FROM outbox_events WHERE status='pending' LIMIT 10
       ├── Publish to EventBridge
       └── UPDATE outbox_events SET status='published'
              │
              ▼
        EventBridge Bus
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
 Notification Incident Shelter
  Service    Service  Service
```

### 4.2 outbox-relay-worker Lambda

```javascript
// workers/outbox-relay-worker.js
export const handler = async (event) => {
  const db = await getDbConnection();
  const eventBridge = new EventBridgeClient({});
  
  // Lock และดึง pending events (FOR UPDATE SKIP LOCKED)
  const { rows } = await db.query(`
    SELECT * FROM outbox_events
    WHERE status = 'pending' AND next_retry_at <= NOW()
    ORDER BY created_at ASC
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  `);

  for (const outboxEvent of rows) {
    try {
      await eventBridge.send(new PutEventsCommand({
        Entries: [{
          Source: 'trace-missing-service',
          DetailType: outboxEvent.event_type,
          Detail: JSON.stringify(outboxEvent.payload),
          EventBusName: process.env.EVENT_BUS_NAME,
        }]
      }));

      await db.query(
        `UPDATE outbox_events SET status='published', published_at=NOW() WHERE id=$1`,
        [outboxEvent.id]
      );
    } catch (err) {
      await db.query(
        `UPDATE outbox_events SET status='failed', attempts=attempts+1,
         next_retry_at=NOW() + INTERVAL '1 minute' * attempts WHERE id=$1`,
        [outboxEvent.id]
      );
    }
  }
};
```

### 4.3 Trigger outbox-relay-worker

```hcl
# EventBridge Scheduler ทุก 500ms (minimum 1 minute ใน EventBridge)
# ใช้ SQS trigger แทน — outbox-relay-queue ถูก poll โดย Lambda
resource "aws_lambda_event_source_mapping" "outbox_relay_trigger" {
  event_source_arn = aws_sqs_queue.outbox_relay.arn
  function_name    = aws_lambda_function.outbox_relay_worker.arn
  batch_size       = 1

  # กรณีต้องการ poll ถี่กว่า 1 นาที ใช้ EventBridge Scheduler rate(1 minute)
  # แล้วให้ Lambda ทำ loop ภายใน
}

resource "aws_scheduler_schedule" "outbox_relay" {
  name = "outbox-relay-schedule"
  flexible_time_window { mode = "OFF" }
  schedule_expression = "rate(1 minute)"
  
  target {
    arn      = aws_lambda_function.outbox_relay_worker.arn
    role_arn = aws_iam_role.scheduler_role.arn
  }
}
```

---

## 5. Inbox Consumer — รับ Events จาก External Services

### 5.1 Flow

```
Shelter Service → EventBridge → SQS (inbox-events-queue) → inbox-consumer-worker Lambda
                                                                    │
                                          ┌─────────────────────────┤
                                          ▼                         ▼
                                shelter_person_cache         matching-jobs-queue
                                (upsert in RDS)            (trigger auto-match)
```

### 5.2 inbox-consumer-worker Lambda

```javascript
// workers/inbox-consumer-worker.js
export const handler = async (event) => {
  const db = await getDbConnection();
  const sqs = new SQSClient({});

  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    const { event_type, payload, idempotency_key } = message.detail ?? message;

    // Idempotency check
    const existing = await db.query(
      `SELECT id FROM inbox_events WHERE idempotency_key=$1`, [idempotency_key]
    );
    if (existing.rows.length > 0) continue; // Already processed

    await db.query(`INSERT INTO inbox_events (source_service, event_type, payload, idempotency_key, status)
                    VALUES ($1, $2, $3, $4, 'processing')`,
                    [message.source, event_type, payload, idempotency_key]);

    try {
      switch (event_type) {
        case 'shelter.resident.created':
          await upsertShelterPersonCache(db, payload);
          // Fan-out: trigger matching for all open cases
          await triggerAutoMatch(sqs, payload.resident_id, payload.shelter_id);
          break;
          
        case 'shelter.resident.updated':
          await upsertShelterPersonCache(db, payload);
          await invalidateSimilarityCache(db, payload.resident_id);
          break;

        case 'shelter.resident.released':
          await deactivateShelterCache(db, payload.resident_id);
          break;

        case 'incident.created':
        case 'incident.updated':
          await upsertIncidentReference(db, payload);
          if (payload.severity_changed) {
            await reprioritizeCases(db, payload.incident_id, payload.new_severity);
          }
          break;
      }

      await db.query(
        `UPDATE inbox_events SET status='processed', processed_at=NOW() WHERE idempotency_key=$1`,
        [idempotency_key]
      );
    } catch (err) {
      await db.query(
        `UPDATE inbox_events SET status='failed' WHERE idempotency_key=$1`, [idempotency_key]
      );
      throw err; // ให้ SQS retry
    }
  }
};
```

---

## 6. Matching Pipeline บน AWS

### 6.1 Architecture

```
POST /api/v1/matches/trigger
         │
         ▼
  match-handler Lambda
         │
         ├── INSERT INTO matching_jobs (status='queued')
         └── SQS SendMessage → matching-jobs-queue
                    │
                    ▼
         matching-orchestrator Lambda
                    │
         ┌──────────┼──────────────┐
         ▼          ▼              ▼
    Rule-based  AI/NLP match  Face Recognition
    matching    (Lambda)       ├── SQS → face-recognition-queue
    (in-Lambda)                └── face-recognition-worker Lambda
                                        │
                                        ▼
                                  pgvector similarity search
                                  INSERT INTO matching_results
                                        │
                                        ▼
                              If score > threshold:
                              SQS → outbox-relay-queue
                              → EventBridge → Notification Service
```

### 6.2 matching-orchestrator Lambda

```javascript
// workers/matching-orchestrator.js
export const handler = async (event) => {
  const db = await getDbConnection();
  const sqs = new SQSClient({});

  for (const record of event.Records) {
    const { jobId, caseId, personId, methods } = JSON.parse(record.body);

    await db.query(
      `UPDATE matching_jobs SET status='processing' WHERE id=$1`, [jobId]
    );

    // 1. Rule-based matching (ทำใน Lambda นี้เลย — เร็ว)
    if (methods.includes('rule_based')) {
      const candidates = await ruleBasedMatch(db, personId);
      await storeMatchResults(db, caseId, personId, candidates, 'rule_based');
    }

    // 2. Face recognition (ส่งไป separate queue — อาจนาน)
    if (methods.includes('face_recognition')) {
      await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.FACE_RECOGNITION_QUEUE_URL,
        MessageBody: JSON.stringify({ jobId, caseId, personId }),
      }));
    }

    await db.query(
      `UPDATE matching_jobs SET status='completed' WHERE id=$1`, [jobId]
    );
  }
};

async function ruleBasedMatch(db, personId) {
  // เปรียบเทียบ name, dob, gender กับ shelter_person_cache
  const { rows } = await db.query(`
    SELECT spc.*, 
      CASE WHEN p.full_name ILIKE spc.full_name THEN 0.4 ELSE 0 END +
      CASE WHEN p.gender = spc.gender THEN 0.2 ELSE 0 END +
      CASE WHEN p.date_of_birth = spc.date_of_birth THEN 0.4 ELSE 0 END AS score
    FROM persons p
    JOIN shelter_person_cache spc ON spc.is_active = true
    WHERE p.id = $1
    HAVING score > 0.3
    ORDER BY score DESC
  `, [personId]);
  return rows;
}
```

### 6.3 face-recognition-worker Lambda

```javascript
// workers/face-recognition-worker.js
// ใช้ Lambda Layer ที่มี face recognition model (หรือ call SageMaker endpoint)
export const handler = async (event) => {
  const db = await getDbConnection();
  const sageMaker = new SageMakerRuntimeClient({});

  for (const record of event.Records) {
    const { jobId, caseId, personId } = JSON.parse(record.body);

    // ดึง face embedding ของ missing person
    const { rows: photos } = await db.query(
      `SELECT face_embedding FROM person_photos
       WHERE person_id=$1 AND face_embedding IS NOT NULL AND deleted_at IS NULL
       ORDER BY is_primary DESC LIMIT 1`,
      [personId]
    );
    if (!photos.length) return;

    // pgvector similarity search กับ shelter_person_cache
    const { rows: matches } = await db.query(`
      SELECT resident_id, shelter_id,
             1 - (face_embedding <=> $1::vector) AS similarity
      FROM shelter_person_cache
      WHERE face_embedding IS NOT NULL AND is_active = true
        AND 1 - (face_embedding <=> $1::vector) > 0.75
      ORDER BY similarity DESC
      LIMIT 20
    `, [photos[0].face_embedding]);

    // Store results
    for (const match of matches) {
      await db.query(`
        INSERT INTO matching_results
          (person_id, case_id, shelter_id, shelter_resident_id, match_score, match_method, matched_fields, status, idempotency_key)
        VALUES ($1, $2, $3, $4, $5, 'face_recognition', '{}', 'pending', $6)
        ON CONFLICT (idempotency_key) DO NOTHING
      `, [personId, caseId, match.shelter_id, match.resident_id, match.similarity,
          `face-${caseId}-${match.resident_id}`]);
    }

    // Publish event ถ้า score สูงกว่า threshold
    const highScoreMatches = matches.filter(m => m.similarity > 0.85);
    if (highScoreMatches.length > 0) {
      await db.query(`
        INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
        VALUES ('matching_results', $1, 'missing.match.detected', $2)
      `, [caseId, JSON.stringify({ caseId, personId, matches: highScoreMatches })]);
    }
  }
};
```

---

## 7. API Gateway + Lambda Authorizer

```hcl
resource "aws_apigatewayv2_api" "main" {
  name          = "trace-missing-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["https://trace-missing.app"]
    allow_methods = ["GET", "POST", "PATCH", "DELETE"]
    allow_headers = ["Content-Type", "Authorization", "X-Correlation-ID"]
  }
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  name             = "jwt-authorizer"
  identity_sources = ["$request.header.Authorization"]
  
  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://cognito-idp.${var.region}.amazonaws.com/${var.user_pool_id}"
  }
}

# Rate limiting ผ่าน Usage Plans
resource "aws_api_gateway_usage_plan" "authenticated_user" {
  name = "authenticated-user"
  throttle_settings {
    burst_limit = 50
    rate_limit  = 300  # 300 req/min
  }
}
```

---

## 8. RDS Aurora PostgreSQL + RDS Proxy

```hcl
resource "aws_rds_cluster" "postgres" {
  cluster_identifier      = "trace-missing-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  database_name           = "trace_missing"
  master_username         = var.db_username
  manage_master_user_password = true  # AWS Secrets Manager
  
  # Multi-AZ
  availability_zones = ["ap-southeast-1a", "ap-southeast-1b"]
  
  backup_retention_period = 7
  deletion_protection     = true
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
}

resource "aws_rds_cluster_instance" "writer" {
  identifier         = "trace-missing-writer"
  cluster_identifier = aws_rds_cluster.postgres.id
  instance_class     = "db.r6g.large"
}

resource "aws_rds_cluster_instance" "reader" {
  count              = 2
  identifier         = "trace-missing-reader-${count.index}"
  cluster_identifier = aws_rds_cluster.postgres.id
  instance_class     = "db.r6g.large"
}

# RDS Proxy — จัดการ connection pooling สำหรับ Lambda
resource "aws_db_proxy" "main" {
  name                   = "trace-missing-proxy"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = aws_iam_role.rds_proxy_role.arn
  vpc_subnet_ids         = var.private_subnet_ids
  
  auth {
    auth_scheme = "SECRETS"
    secret_arn  = aws_rds_cluster.postgres.master_user_secret[0].secret_arn
    iam_auth    = "REQUIRED"
  }
}
```

---

## 9. S3 — Photo Storage

```hcl
resource "aws_s3_bucket" "photos" {
  bucket = "trace-missing-photos-${var.env}"
}

resource "aws_s3_bucket_lifecycle_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id
  
  rule {
    id     = "move-to-ia"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
  }
}

# Lambda ที่ handle photo upload ต้องใช้ pre-signed URL
# ส่ง pre-signed URL กลับไปให้ client upload โดยตรง (ไม่ผ่าน Lambda)
```

**Photo Upload Flow:**
```
Client → POST /api/v1/persons/:id/photos
              │
              ▼
       person-handler Lambda
              │
              ├── Generate S3 pre-signed URL (PUT, expires 15min)
              ├── INSERT INTO person_photos (file_path, status='pending')
              └── Return { uploadUrl, photoId }
              
Client → PUT [S3 pre-signed URL] (upload directly to S3)
              │
              ▼
       S3 Event Notification → SQS → face-recognition-worker Lambda
              │
              ├── Download photo from S3
              ├── Run face embedding (SageMaker / Lambda Layer)
              └── UPDATE person_photos SET face_embedding=$1, status='ready'
```

---

## 10. ElastiCache Redis

```hcl
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "trace-missing-redis"
  description          = "Redis for trace-missing-service"
  node_type            = "cache.r6g.large"
  
  num_cache_clusters   = 2  # Primary + 1 Replica
  automatic_failover_enabled = true
  multi_az_enabled     = true
  
  engine_version       = "7.0"
  port                 = 6379
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}
```

**Cache Keys ที่ใช้:**

| Key Pattern | TTL | Evict On |
|---|---|---|
| `missing:case:list:{officerId}:{status}:{page}` | 60s | PATCH /cases/:id/status |
| `missing:match:pending_count:{caseId}` | 30s | POST /matches/:id/review |
| `missing:incident:{incidentId}` | 300s | incident.updated consumed |
| `missing:report:rate:{ip}` | 60s | Rate limiting |

---

## 11. EventBridge — Cross-Service Communication

```hcl
resource "aws_cloudwatch_event_bus" "main" {
  name = "trace-missing-event-bus"
}

# Rule: รับ events จาก Shelter Service
resource "aws_cloudwatch_event_rule" "shelter_events" {
  event_bus_name = aws_cloudwatch_event_bus.main.name
  name           = "shelter-resident-events"
  
  event_pattern = jsonencode({
    source      = ["shelter-service"]
    detail-type = ["shelter.resident.created", "shelter.resident.updated",
                   "shelter.resident.released", "shelter.resident.transferred"]
  })
}

resource "aws_cloudwatch_event_target" "shelter_to_sqs" {
  rule           = aws_cloudwatch_event_rule.shelter_events.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "shelter-to-inbox-queue"
  arn            = aws_sqs_queue.inbox_events.arn
}

# Rule: ส่ง events จาก Missing Service ออกไป
resource "aws_cloudwatch_event_rule" "missing_events_out" {
  event_bus_name = aws_cloudwatch_event_bus.main.name
  name           = "missing-service-events"
  
  event_pattern = jsonencode({
    source = ["trace-missing-service"]
  })
}
```

---

## 12. IAM Roles สำหรับ Lambda

```hcl
# API Handler Lambda Role
resource "aws_iam_role_policy" "api_handler_policy" {
  role = aws_iam_role.api_handler.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage"]
        Resource = [
          aws_sqs_queue.matching_jobs.arn,
          aws_sqs_queue.outbox_relay.arn
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["rds-db:connect"]
        Resource = ["arn:aws:rds-db:*:*:dbuser/${aws_db_proxy.main.id}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["elasticache:Connect"]
        Resource = [aws_elasticache_replication_group.main.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject"]
        Resource = ["${aws_s3_bucket.photos.arn}/*"]
      }
    ]
  })
}

# Worker Lambda Role (additional permissions)
resource "aws_iam_role_policy" "worker_policy" {
  role = aws_iam_role.worker.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["events:PutEvents"]
        Resource = [aws_cloudwatch_event_bus.main.arn]
      },
      {
        Effect = "Allow"
        Action = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = ["arn:aws:sqs:*:*:trace-missing-*"]
      }
    ]
  })
}
```

---

## 13. Dead Letter Queue (DLQ) Strategy

| Queue | DLQ | maxReceiveCount | Alert Threshold |
|---|---|---|---|
| outbox-relay-queue | outbox-relay-dlq | 3 | > 0 messages for 15 min |
| inbox-events-queue | inbox-events-dlq | 3 | > 0 messages for 15 min |
| matching-jobs-queue | matching-jobs-dlq | 2 | > 0 messages |
| face-recognition-queue | face-recognition-dlq | 2 | > 0 messages |
| integration-retry-queue | integration-retry-dlq | 5 | > 5 messages |

```hcl
# CloudWatch Alarm สำหรับ DLQ
resource "aws_cloudwatch_metric_alarm" "dlq_alert" {
  for_each = {
    outbox     = aws_sqs_queue.outbox_relay_dlq.name
    inbox      = aws_sqs_queue.inbox_events_dlq.name
    matching   = aws_sqs_queue.matching_jobs_dlq.name
  }

  alarm_name          = "dlq-${each.key}-messages-visible"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 900  # 15 minutes
  statistic           = "Sum"
  threshold           = 0

  dimensions = { QueueName = each.value }
  alarm_actions = [aws_sns_topic.on_call_alerts.arn]
}
```

**Manual Retry Endpoint:**
```
POST /internal/v1/outbox/retry  → triggers outbox-relay-worker manually
POST /internal/v1/integrations/failed/:id/retry → re-queue ไปที่ integration-retry-queue
```

---

## 14. Observability

### CloudWatch Metrics ที่สำคัญ

| Metric | Source | Alert ถ้า |
|---|---|---|
| Lambda Duration | CloudWatch | p99 > 25s |
| Lambda Errors | CloudWatch | > 1% error rate |
| SQS ApproximateAgeOfOldestMessage | CloudWatch | outbox > 60s |
| SQS NumberOfMessagesSent | CloudWatch | monitoring throughput |
| RDS CPUUtilization | CloudWatch | > 80% |
| RDS DatabaseConnections | CloudWatch | > 80% of max |
| ElastiCache CacheHits/Misses | CloudWatch | hit rate < 70% |

### X-Ray Tracing

```javascript
// Lambda handler ทุกตัว enable X-Ray
import { captureAWSv3Client } from 'aws-xray-sdk';
const sqs = captureAWSv3Client(new SQSClient({}));
const eb  = captureAWSv3Client(new EventBridgeClient({}));
```

### Structured Logging

```javascript
// ทุก Lambda log ในรูปแบบ JSON พร้อม correlation headers
const logger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({
    level: 'INFO', message: msg,
    correlationId: process.env.CORRELATION_ID,
    traceId: process.env._X_AMZN_TRACE_ID,
    service: 'trace-missing-service',
    ...meta,
    timestamp: new Date().toISOString(),
  }))
};
```

---

## 15. สรุป Mapping: เดิม → AWS

| สถาปัตยกรรมเดิม | AWS Equivalent |
|---|---|
| Express/FastAPI HTTP Server | **API Gateway HTTP API + Lambda** |
| Outbox Relay Worker (500ms loop) | **EventBridge Scheduler + outbox-relay-worker Lambda** |
| Inbox Consumer Worker | **SQS inbox-events-queue + inbox-consumer-worker Lambda** |
| Matching Orchestrator | **SQS matching-jobs-queue + matching-orchestrator Lambda** |
| AI/Face Worker (GPU) | **SQS face-recognition-queue + Lambda (หรือ SageMaker)** |
| Integration Retry Worker | **SQS FIFO + integration-retry-worker Lambda** |
| Cache TTL Eviction Worker | **EventBridge Scheduler + cache-eviction-worker Lambda** |
| Kafka/RabbitMQ | **Amazon EventBridge + SQS** |
| Redis Cache | **ElastiCache Redis** |
| S3/Object Storage | **Amazon S3** |
| PostgreSQL Primary + Replicas | **Aurora PostgreSQL (Multi-AZ)** |
| API Rate Limiting | **API Gateway Usage Plans** |
| Circuit Breaker | **AWS Lambda Powertools (circuit breaker utility)** |
| Distributed Tracing | **AWS X-Ray + CloudWatch** |
