# Demo Deployment Guide

## 1. Prerequisites
- AWS CLI configured with Learner Lab credentials
- Terraform installed
- Node.js installed

## 2. Infrastructure Deployment
```bash
cd infrastructure/terraform
terraform init
terraform apply -var='db_password=YourSecurePassword123'
```

*Note: Terraform will automatically package the backend code from the `backend/` directory.*

## 3. Database Setup
Once RDS is up, get the endpoint from terraform output and run the schema:
```bash
psql -h <db_endpoint> -U dbadmin -d trace_missing -f backend/schema.sql
```

## 4. Testing the API
Use the `api_endpoint` output from Terraform to make calls:
```bash
curl -X POST <api_endpoint>/reports -d '{"incidentId": 1, "details": "Person missing in flood"}'
```
