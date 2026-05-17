# Trace Missing Service - API Documentation

เอกสารนี้รวบรวม API Contract ทั้งหมดของ Trace Missing Service ที่อ้างอิงจาก Source Code จริงในระบบ โดยครอบคลุมทั้ง Synchronous APIs (REST) และ Asynchronous Events (SQS/EventBridge)

---

## 1. Synchronous Function Contracts

### API Contract #1: Create Missing Report

**ข้อมูลทั่วไป**
*   **Name:** Create Missing Report
*   **Method:** POST
*   **Path:** `/api/v1/reports`
*   **Type:** Synchronous

**คำอธิบาย**
สำหรับเจ้าหน้าที่และประชาชนทั่วไปเพื่อสร้างรายงานแจ้งบุคคลสูญหาย โดยระบบจะนำข้อมูลนี้ไปสร้างเคส (Case) ให้อัตโนมัติและเตรียมเข้าสู่กระบวนการจับคู่ (Matching) ระบบต้องการตอบกลับทันที (Synchronous) เพื่อให้ผู้แจ้งทราบ `reportId` สำหรับใช้อ้างอิง

**Request**

**Headers**
*   `Authorization`: Bearer `<JWT_TOKEN>`
*   `X-Correlation-ID`: `UUID` (optional, ระบบจะสร้างให้หากไม่มี)
*   `Accept`: `application/json`

**Body:**
```json
{
  "incidentId": "INC-2026-001",
  "details": "สวมเสื้อสีแดง กางเกงยีนส์ พลัดหลงบริเวณศูนย์อพยพหลัก",
  "reporterId": "USR-10293",
  "reporterName": "สมชาย ใจดี",
  "missingPersonName": "สมหญิง ใจดี",
  "age": 28,
  "gender": "FEMALE"
}
```

**Validation Rules**
*   `incidentId` ต้องไม่เป็นค่าว่าง (is required) 
*   `details` ต้องไม่เป็นค่าว่าง (is required)

**Response**

**Success (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Report created successfully",
  "data": {
    "reportId": 1054,
    "status": "pending"
  }
}
```

**Error:**
**400 Bad Request**
```json
{
  "success": false,
  "code": "VALIDATION_FAILED",
  "message": "Validation failed: incidentId is required, details is required"
}
```

**Dependency / Reliability**
*   **External call timeout:** 3 seconds (API Gateway limit 30s)
*   **Database:** บันทึกข้อมูลลง PostgreSQL แบบ Transaction พร้อมกับ Outbox table
*   **Retry:** ไม่มี Retry สำหรับ Synchronous API (Client ต้อง retry เองหากเจอ 5xx)

---

### API Contract #2: Register Person (Found Victim / Unidentified)

**ข้อมูลทั่วไป**
*   **Name:** Register Person
*   **Method:** POST
*   **Path:** `/api/v1/persons`
*   **Type:** Synchronous

**คำอธิบาย**
ใช้สำหรับให้เจ้าหน้าที่กู้ภัย โรงพยาบาล หรือศูนย์พักพิง ลงทะเบียนข้อมูลผู้ประสบภัยที่พบเจอ (ทั้งที่ระบุตัวตนได้และนิรนาม) เพื่อนำเข้าระบบค้นหาและเปรียบเทียบกับข้อมูลผู้สูญหาย

**Request**

**Headers**
*   `Authorization`: Bearer `<JWT_TOKEN>`
*   `Content-Type`: `application/json`

**Body:**
```json
{
  "caseId": "CASE-99281",
  "fullName": "ชายไม่ทราบชื่อ 01",
  "gender": "MALE",
  "ageCategory": "ADULT",
  "foundLocation": "โรงพยาบาลสนาม มหาวิทยาลัยธรรมศาสตร์",
  "lifeStatus": "ALIVE",
  "physicalDescription": "มีรอยสักที่แขนขวา สูงประมาณ 170 ซม."
}
```

**Validation Rules**
*   `caseId` ต้องไม่เป็นค่าว่าง (is required)
*   `fullName` ต้องไม่เป็นค่าว่าง (is required)

**Response**

**Success (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Person registered successfully",
  "data": {
    "personId": "PER-558291"
  }
}
```

**Error:**
**400 Bad Request**
```json
{
  "success": false,
  "code": "VALIDATION_FAILED",
  "message": "Validation failed: caseId is required"
}
```

**Dependency / Reliability**
*   **Database:** Insert ลงตาราง `persons`

---

### API Contract #3: Generate Photo Upload URL

**ข้อมูลทั่วไป**
*   **Name:** Generate Photo Upload URL
*   **Method:** POST
*   **Path:** `/api/v1/persons/{id}/photos`
*   **Type:** Synchronous

**คำอธิบาย**
ใช้เพื่อขอ Pre-signed URL ของ Amazon S3 สำหรับให้อุปกรณ์ของผู้ใช้ (Mobile/Web) อัปโหลดรูปภาพใบหน้าของผู้สูญหายหรือผู้ประสบภัยโดยตรง โดยไม่ต้องส่งไฟล์ผ่าน API Gateway เพื่อลดภาระและข้อจำกัดเรื่องขนาดไฟล์

**Request**

**Headers**
*   `Authorization`: Bearer `<JWT_TOKEN>`

**Path Parameters**
*   `id`: รหัสอ้างอิงของบุคคล (`personId`) เช่น `PER-558291`

**Response**

**Success (200 OK):**
```json
{
  "statusCode": 200,
  "uploadUrl": "https://trace-missing-photos.s3.amazonaws.com/PER-558291/photo-123.jpg?AWSAccessKeyId=...&Signature=...&Expires=900",
  "photoId": "PH-9912",
  "expiresIn": 900
}
```

**Error:**
**400 Bad Request**
```json
{
  "success": false,
  "message": "personId is required"
}
```

**Dependency / Reliability**
*   **External Service:** อ้างอิง Amazon S3 SDK
*   ภาพที่อัปโหลดจะถูกนำไปรัน Face Recognition แบบ Asynchronous ทันทีเมื่อ S3 ส่ง Event

---

### API Contract #4: Update Case Status

**ข้อมูลทั่วไป**
*   **Name:** Update Case Status
*   **Method:** PATCH
*   **Path:** `/api/v1/cases/{id}/status`
*   **Type:** Synchronous

**คำอธิบาย**
อัปเดตสถานะของเคสผู้สูญหาย เช่น เปลี่่ยนเป็น "พบตัวแล้ว (REUNITED)" หรือ "กำลังตรวจสอบ (IN_PROGRESS)"

**Request**

**Headers**
*   `Authorization`: Bearer `<JWT_TOKEN>`

**Path Parameters**
*   `id`: รหัสของเคส เช่น `CASE-99281`

**Body:**
```json
{
  "status": "REUNITED",
  "notes": "ยืนยันตัวตนกับญาติที่ศูนย์พักพิง A เรียบร้อยแล้ว"
}
```

**Response**

**Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Case status updated successfully"
}
```

---

### API Contract #5: Trigger Matching Logic

**ข้อมูลทั่วไป**
*   **Name:** Trigger Matching
*   **Method:** POST
*   **Path:** `/api/v1/matches/trigger`
*   **Type:** Asynchronous (Background Job Trigger)

**คำอธิบาย**
รับคำสั่งเพื่อสั่งรันกระบวนการ Matching (Rule-based หรือ Face Recognition) โดย API จะส่งข้อความไปที่ SQS `matching-jobs-queue` และตอบกลับ Client ทันทีว่ารับเรื่องแล้ว

**Request**

**Headers**
*   `Authorization`: Bearer `<JWT_TOKEN>`

**Body:**
```json
{
  "caseId": "CASE-99281",
  "personId": "PER-558291",
  "methods": ["rule_based", "face_recognition"]
}
```

**Validation Rules**
*   `caseId` ต้องไม่ว่าง
*   `personId` ต้องไม่ว่าง
*   `methods` ต้องเป็น Array

**Response**

**Success (200 OK):**
```json
{
  "statusCode": 200,
  "jobId": "JOB-1029384",
  "message": "Matching job triggered successfully"
}
```

**Dependency / Reliability**
*   **Message Broker:** ส่งข้อความเข้า SQS 
*   ระบบมี `matching-orchestrator.js` คอยดึงงานไปประมวลผลต่อ

---

## 2. Asynchronous Function Contracts (Events / Webhooks)

### Message Contract #1: Consume Shelter Resident Created

**ข้อมูลทั่วไป**
*   **Message Name:** `shelter.resident.created`
*   **Interaction Style:** Event-Driven (Consume)
*   **Source:** Shelter Service (via EventBridge -> SQS `inbox-events-queue`)
*   **Consumer Lambda:** `inbox-consumer-worker.js`

**คำอธิบาย**
ระบบได้รับ Event นี้เมื่อมีผู้อพยพรายใหม่เข้าไปลงทะเบียนในศูนย์พักพิง (Shelter Service) ระบบจะนำข้อมูลนี้ไปสร้าง `shelter_person_cache` และอาจรัน Trigger Matching อัตโนมัติ

**Message Body (SQS Payload)**
```json
{
  "source": "shelter-service",
  "detail-type": "shelter.resident.created",
  "detail": {
    "event_type": "shelter.resident.created",
    "idempotency_key": "evt-77a8b-11c",
    "payload": {
      "shelter_id": "SH-BKK-01",
      "resident_id": "RES-88910",
      "name": "ไม่ทราบชื่อ สวมเสื้อสีเขียว",
      "gender": "MALE",
      "age": 45,
      "checked_in_at": "2026-05-17T12:00:00Z"
    }
  }
}
```

**Validation Rules**
*   `idempotency_key` ต้องมีค่าและไม่ซ้ำ (idempotent processing)
*   จัดการ Transaction โดยเช็คในตาราง `inbox_events` ก่อน

**Response**
*   **Success:** ทำการ `COMMIT` Transaction และอัปเดต `status='processed'` ในฐานข้อมูล
*   **Error:** ทำการ `ROLLBACK` และปล่อยให้ SQS Retry ตาม Visibility Timeout

---

### Message Contract #2: Consume Incident Updated

**ข้อมูลทั่วไป**
*   **Message Name:** `incident.updated`
*   **Interaction Style:** Event-Driven (Consume)
*   **Source:** Incident Service (via SQS `inbox-events-queue`)
*   **Consumer Lambda:** `inbox-consumer-worker.js`

**คำอธิบาย**
อัปเดตข้อมูลหรือสถานะของภัยพิบัติ เช่น จากระดับเฝ้าระวังเป็นวิกฤต ซึ่งจะช่วยให้ Trace Missing Service สามารถปรับ Priority ของเคสผู้สูญหายที่ผูกกับ Incident นั้นๆ ได้

**Message Body**
```json
{
  "source": "incident-service",
  "detail-type": "incident.updated",
  "detail": {
    "event_type": "incident.updated",
    "idempotency_key": "evt-inc-upd-991",
    "payload": {
      "incident_id": "INC-2026-001",
      "status": "CRITICAL",
      "severity_changed": true,
      "new_severity": "HIGH"
    }
  }
}
```

---

### Message Contract #3: Produce Missing Match Detected

**ข้อมูลทั่วไป**
*   **Message Name:** `missing.match.detected`
*   **Interaction Style:** Event-Driven (Publish / Outbox Pattern)
*   **Producer:** Trace Missing Service (`outbox-relay-worker.js`)
*   **Destination:** EventBridge Bus (`EVENT_BUS_NAME`)

**คำอธิบาย**
ส่งออกไปเมื่ออัลกอริทึม (`face-recognition-worker.js` หรือ rule-based) ประเมินว่าเคสคนหายและผู้ประสบภัยนิรนามมีความคล้ายคลึงกันเกินค่า Threshold ที่ตั้งไว้ Notification Service จะรับ Event นี้ไปแจ้งเตือน

**Message Body (Published to EventBridge)**
```json
{
  "Source": "trace-missing-service",
  "DetailType": "missing.match.detected",
  "Detail": {
    "caseId": "CASE-99281",
    "personId": "PER-558291",
    "matches": [
      {
        "resident_id": "RES-88910",
        "shelter_id": "SH-BKK-01",
        "similarity": 0.92,
        "match_method": "face_recognition"
      }
    ]
  }
}
```

**Dependency / Reliability**
*   **Outbox Pattern:** บันทึกลงตาราง `outbox_events` ก่อนเสมอ 
*   **Cron/Polling:** `outbox-relay-worker.js` จะดึงข้อมูลด้วย `FOR UPDATE SKIP LOCKED` ไป Publish สู่ EventBridge เพื่อป้องกันปัญหา Dual Write
*   **Retry:** หากส่ง EventBridge ไม่สำเร็จ จะมีการนับ `attempts` และ `next_retry_at` เพิ่มขึ้นในฐานข้อมูล
