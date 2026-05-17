# Trace Missing Service - Project Documentation

## Service Overview

### 1. Service Owner
**Name:** Antigravity Engineering Team
**Service:** Trace Missing Service
**Repository:** Antigravity / Trace-Missing-Service

### 2. Service Purpose
The Trace Missing Service is a core component of the Antigravity distributed disaster-response platform. Its primary purpose is to act as a centralized, highly available registry for tracking missing persons and unidentified victims/deceased individuals during disaster events. The service facilitates rapid reunification by automatically matching missing person reports with unidentified evacuees and patients across shelters and hospitals.

### 3. Pain Point ที่แก้ไข (Pain points addressed)
During disaster events, chaos and rapid evacuations lead to separated families. Relatives lack a reliable channel to track missing loved ones, while first responders, shelters, and hospitals encounter unidentified victims but lack a centralized system to cross-reference them against active missing person reports. This service eliminates the silos between hospitals, shelters, and citizen reporting to accelerate the reunification process.

### 4. Target Users
1.  **Citizens / Relatives:** To report missing family members and track their status.
2.  **Shelter Volunteers:** To register evacuees, which automatically syncs to the system.
3.  **Medical Staff / First Responders:** To report unidentified victims or deceased individuals.
4.  **Disaster Response Coordinators:** To monitor overall reunification metrics.

### 5. Service Boundary
#### 1. In-scope Responsibilities
*   **Missing Person Management:** Ingesting and storing reports of missing individuals.
*   **Unidentified Victim Management:** Storing data on unidentified evacuees and hospital patients.
*   **Automated Matching:** Utilizing rule-based and AI (face recognition) matching to link missing persons with unidentified victims.
*   **Location Tracking:** Updating and maintaining the latest known location of individuals based on incoming shelter and hospital events.
*   **Reunification Workflows:** Managing the status transitions of missing cases (e.g., pending, matched, reunited).

#### 2. Out-of-scope / Not Responsible For
*   **Incident Command:** The service does not manage disaster resource allocation or emergency dispatches.
*   **Direct Medical Care:** The service does not store clinical/medical records beyond what is necessary for identification.
*   **Physical Search Operations:** The service is purely an information aggregator and matching engine.

### 6. Autonomy / Decision Logic
The service operates with a high degree of autonomy in its matching engine:
*   **Rule-based Match Scoring:** The `matching-orchestrator` worker autonomously scores incoming records against the `shelter_person_cache` and other missing cases based on attributes (age, gender, name similarity).
*   **AI Face Recognition:** The `face-recognition-worker` autonomously processes uploaded photos, generates embeddings via SageMaker, and executes similarity searches via `pgvector`.
*   **Proactive Alerting:** When a match score exceeds a predefined threshold (e.g., > 85%), the service autonomously publishes a `missing.match.detected` event via its transactional outbox.

### 7. Owned Data
*   **Missing Reports (`missing_reports`):** Core domain records containing reporter details, physical descriptions, and incident associations.
*   **Matching Results (`matching_results`):** Computed similarity scores and match statuses between different entities.
*   **Inbox/Outbox Events (`inbox_events`, `outbox_events`):** Idempotency and transactional event logs for reliable async communication.

### 8. Linked Data (Reference Only)
*   **Incidents (`incidents`):** The service references disaster incidents (via `incident_id`) from the upstream Incident Service but does not own the incident lifecycle.
*   **Shelters / Hospitals:** The service stores references to shelter IDs and resident IDs purely to track the latest known location.

### 9. Non-Functional Requirements
*   **High Availability:** Event ingestion via SQS (`inbox-events-queue`) ensures the system can accept shelter/hospital updates even under high load or if the DB is temporarily slow.
*   **Data Consistency:** Implementation of the Transactional Outbox pattern ensures that database commits and event publishing (e.g., match detected) are strictly consistent.
*   **Scalability:** Serverless compute (AWS Lambda) allows the `person-handler` and `report-handler` to scale elastically during sudden disaster spikes.

---

## Sync Contract
### Synchronous Function Contract

#### API Contract #1: Create Missing Report
**ข้อมูลทั่วไป**
*   **Name:** Create Missing Report
*   **Method:** POST
*   **Path:** `/api/v1/reports`
*   **Type:** Synchronous

**คำอธิบาย**
Allows citizens or staff to submit a new missing person report, associating it with an active incident.

**Request**
*   **Headers:** `Authorization` (JWT), `X-Correlation-ID`
*   **Body:** 
    ```json
    {
      "incidentId": 123,
      "details": "Wearing a red jacket, last seen near main street.",
      "reporterName": "John Doe",
      "reporterContact": "555-0192"
    }
    ```
*   **Validation Rules:** `incidentId` is required. `details` must not be empty.

**Response**
*   **Success (201 Created):**
    ```json
    {
      "reportId": 456,
      "status": "pending",
      "message": "Report created successfully"
    }
    ```

**Dependency / Reliability**
Handled by `report-handler.js` Lambda. Connects to RDS via RDS Proxy. Fails fast if DB is unavailable.

#### API Contract #2: Register Person (Unidentified/Found)
**ข้อมูลทั่วไป**
*   **Name:** Register Person
*   **Method:** POST
*   **Path:** `/api/v1/persons`
*   **Type:** Synchronous

**คำอธิบาย**
Registers a new person profile, used primarily by responders to log unidentified individuals found at a scene.

**Request**
*   **Headers:** `Authorization` (JWT)
*   **Body:** Contains physical traits, estimated age, gender, and found location.

**Response**
*   **Success (201 Created):** Returns the generated `personId`.

#### API Contract #3: Generate Photo Upload URL
**ข้อมูลทั่วไป**
*   **Name:** Photo Upload
*   **Method:** POST
*   **Path:** `/api/v1/persons/{id}/photos`
*   **Type:** Synchronous

**คำอธิบาย**
Generates a pre-signed Amazon S3 URL allowing the client to securely upload photo evidence without passing heavy binary data through API Gateway/Lambda.

**Response**
*   **Success (200 OK):**
    ```json
    {
      "uploadUrl": "https://trace-missing-photos-prod.s3.amazonaws.com/...",
      "expiresIn": 900
    }
    ```

---

## Async Contract
### Asynchronous Function Contract

#### Message Contract #1: Shelter Resident Created
**ข้อมูลทั่วไป**
*   **Message Name:** `shelter.resident.created`
*   **Producer:** Shelter Service
*   **Consumer:** Trace Missing Service (`inbox-consumer-worker`)
*   **Channel/Queue:** `inbox-events-queue`

**คำอธิบาย**
Received when a new evacuee checks into a shelter. The `inbox-consumer-worker` processes this event to insert the person into the local cache and triggers the matching orchestrator to find potential missing persons.

**Message Body**
```json
{
  "event_type": "shelter.resident.created",
  "idempotency_key": "uuid-v4-string",
  "payload": {
    "shelter_id": "SH-001",
    "resident_id": "RES-999",
    "name": "Jane Doe",
    "gender": "F",
    "age": 30
  }
}
```

**Validation Rules**
Must contain a unique `idempotency_key` to prevent duplicate processing if SQS delivers the message multiple times.

#### Message Contract #2: Missing Match Detected
**ข้อมูลทั่วไป**
*   **Message Name:** `missing.match.detected`
*   **Producer:** Trace Missing Service (`outbox-relay-worker`)
*   **Consumer:** Notification Service / Reunification Dashboard
*   **Channel:** EventBridge / SNS

**คำอธิบาย**
Published when the internal matching engine calculates a high-confidence similarity score between a missing person report and an unidentified victim. Emitted safely using the outbox pattern.

---

## Service Data

### 1. Missing Reports
Stores data related to citizen-submitted missing persons.
*   `id` (PK, SERIAL)
*   `reporter_id` (VARCHAR)
*   `incident_id` (INT, FK reference to Incident context)
*   `details` (TEXT)
*   `status` (VARCHAR, e.g., 'pending', 'matched', 'reunited')

### 2. Matching Results
Stores the output of the matching engine logic.
*   `id` (PK, SERIAL)
*   `report_id` (INT, FK)
*   `score` (DECIMAL, 0.0 to 1.0 confidence score)
*   `status` (VARCHAR)
*   `details` (JSONB, holds specific matched traits or face vector distances)

### 3. Event Sourcing Tables
*   `inbox_events`: Stores incoming `idempotency_key`, `event_type`, and `payload` to prevent duplicate processing.
*   `outbox_events`: Stores outgoing domain events in the same transaction as state changes, polled by the `outbox-relay-worker`.

---

## Service Architecture

### Components
1.  **API Gateway & Lambda Handlers:** `report-handler`, `person-handler`, `case-handler` manage incoming synchronous HTTP traffic.
2.  **Amazon SQS (Event Bus):** Buffers incoming async events (`inbox-events-queue`) and heavy background tasks (`matching-jobs-queue`, `face-recognition-queue`).
3.  **Lambda Workers:** `inbox-consumer-worker` (event ingestion), `matching-orchestrator` (scoring logic), `outbox-relay-worker` (event publishing).
4.  **Amazon RDS (PostgreSQL):** The primary ACID-compliant datastore, housing reports, matches, and inbox/outbox tables. Utilizes `pgvector` for AI face embeddings.
5.  **Amazon S3:** Stores raw image files for missing persons and unidentified victims.

### Explanation
The architecture strictly decouples synchronous ingestion from heavy processing. When a user creates a report, the API Lambda inserts it into PostgreSQL and writes a job to `outbox_events` within a single transaction. The API responds immediately. Behind the scenes, SQS and specialized Lambda workers handle face recognition, similarity scoring, and cross-service notifications. SQS Dead Letter Queues (DLQs) ensure that failed matching jobs or failed event ingestions are caught and retried.

---

## Service Interaction

### Upstream Services (Incoming to Trace Missing)
1.  **Client Applications (Web/Mobile):** Call `/api/v1/reports` and `/api/v1/persons` synchronously to report data.
2.  **Shelter Service:** Publishes `shelter.resident.created` asynchronously via EventBridge/SQS. The Trace Missing Service relies on this to map evacuees to missing cases.
3.  **Pre-Arrival Service:** Publishes unidentified hospital patient events asynchronously.

### Downstream Services (Outgoing from Trace Missing)
1.  **Notification Service:** Subscribes to `missing.match.detected` events generated by the `outbox-relay-worker` to send SMS/Email alerts to relatives.
2.  **Incident Service:** Synchronously queried (or referenced via cached events) to validate that a missing person report belongs to a valid, active disaster incident.

---

## Dependency Mapping

| System / Dependency | Type | Interaction Style | Purpose | Criticality |
| :--- | :--- | :--- | :--- | :--- |
| **Amazon RDS (PostgreSQL)** | Database | Synchronous (via Proxy) | Primary datastore for reports, cases, matches, and outbox. | **Critical.** If down, APIs fail. |
| **Amazon SQS** | Queue | Asynchronous | Buffers incoming events and heavy compute jobs (matching, AI). | **Critical.** Ensures resiliency under load. |
| **Shelter Service** | External Service | Asynchronous (Event) | Provides live evacuee data for matching. | Non-Critical. Can process delayed events. |
| **Amazon S3** | Storage | Synchronous (Pre-signed URL) | Stores photo evidence for victims. | Non-Critical. Text reports can proceed without photos. |
| **EventBridge** | Message Bus | Asynchronous | Routes outgoing events to other domains. | Critical for cross-service workflow. |
