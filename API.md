# Cookie Consent Backend API Documentation

## Base URL

```
http://localhost:5001
```

## Authentication

Currently, the API does not require authentication. In production, consider implementing JWT-based authentication.

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "errors": array (only on validation errors)
}
```

## Endpoints

### Health Check

**GET** `/health`

Returns server health status.

**Response:**

```json
{
  "success": true,
  "message": "Cookie Consent Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Record Consent

**POST** `/api/consent/record`

Records a new consent decision.

**Request Body:**

```json
{
  "userId": "string (required, 1-255 chars)",
  "sessionId": "string (required, 1-255 chars)",
  "consentType": "string (required, one of: necessary, functional, analytics, marketing, all)",
  "consentStatus": "string (required, one of: granted, denied, withdrawn)",
  "ipAddress": "string (required, valid IP address)",
  "userAgent": "string (required, max 1000 chars)",
  "purpose": "string (required, 1-500 chars)",
  "dataCategories": "array (required, non-empty array of strings)",
  "processingActivities": "array (required, non-empty array of strings)",
  "thirdPartySharing": "boolean (required)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Consent recorded successfully",
  "consentId": "uuid",
  "data": {
    "id": "uuid",
    "userId": "string",
    "sessionId": "string",
    "consentType": "string",
    "consentStatus": "string",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "ipAddress": "string",
    "userAgent": "string",
    "consentVersion": "1.0.0",
    "dataRetentionPeriod": 2555,
    "purpose": "string",
    "legalBasis": "string",
    "dataController": "string",
    "dataProcessor": "string",
    "thirdPartySharing": true,
    "dataCategories": ["string"],
    "processingActivities": ["string"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2031-01-01T00:00:00.000Z",
    "isAnonymized": false
  }
}
```

### Get Consent Logs

**GET** `/api/consent/logs`

Retrieves consent records with optional filtering.

**Query Parameters:**

- `userId` (optional): Filter by user ID
- `sessionId` (optional): Filter by session ID
- `consentType` (optional): Filter by consent type
- `consentStatus` (optional): Filter by consent status
- `startDate` (optional): Filter records from this date (ISO string)
- `endDate` (optional): Filter records until this date (ISO string)
- `limit` (optional): Number of records to return (default: 50, max: 1000)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "string",
      "sessionId": "string",
      "consentType": "string",
      "consentStatus": "string",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "ipAddress": "string",
      "userAgent": "string",
      "consentVersion": "1.0.0",
      "dataRetentionPeriod": 2555,
      "purpose": "string",
      "legalBasis": "string",
      "dataController": "string",
      "dataProcessor": "string",
      "thirdPartySharing": true,
      "dataCategories": ["string"],
      "processingActivities": ["string"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2031-01-01T00:00:00.000Z",
      "isAnonymized": false
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50
}
```

### Get Specific Consent Record

**GET** `/api/consent/:id`

Retrieves a specific consent record by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "string",
    "sessionId": "string",
    "consentType": "string",
    "consentStatus": "string",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "ipAddress": "string",
    "userAgent": "string",
    "consentVersion": "1.0.0",
    "dataRetentionPeriod": 2555,
    "purpose": "string",
    "legalBasis": "string",
    "dataController": "string",
    "dataProcessor": "string",
    "thirdPartySharing": true,
    "dataCategories": ["string"],
    "processingActivities": ["string"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2031-01-01T00:00:00.000Z",
    "isAnonymized": false
  }
}
```

### Update Consent Status

**PUT** `/api/consent/:id/status`

Updates the status of an existing consent record.

**Request Body:**

```json
{
  "status": "string (required, one of: granted, denied, withdrawn)",
  "userId": "string (optional, for audit trail)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Consent status updated successfully",
  "data": {
    "id": "uuid",
    "userId": "string",
    "sessionId": "string",
    "consentType": "string",
    "consentStatus": "withdrawn",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "ipAddress": "string",
    "userAgent": "string",
    "consentVersion": "1.0.0",
    "dataRetentionPeriod": 2555,
    "purpose": "string",
    "legalBasis": "string",
    "dataController": "string",
    "dataProcessor": "string",
    "thirdPartySharing": true,
    "dataCategories": ["string"],
    "processingActivities": ["string"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2031-01-01T00:00:00.000Z",
    "isAnonymized": false
  }
}
```

### Get Audit Logs

**GET** `/api/consent/:id/audit`

Retrieves audit logs for a specific consent record.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "consentId": "uuid",
      "action": "created",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "ipAddress": "string",
      "userAgent": "string",
      "details": "string",
      "performedBy": "string"
    }
  ]
}
```

## Admin Endpoints

### Data Retention Cleanup

**POST** `/api/consent/admin/cleanup`

Performs data retention cleanup (deletes expired records and anonymizes data).

**Response:**

```json
{
  "success": true,
  "message": "Data retention cleanup completed",
  "deleted": 10,
  "anonymized": 5
}
```

### Compliance Validation

**GET** `/api/consent/admin/compliance`

Validates DPDPA compliance status.

**Response:**

```json
{
  "success": true,
  "compliance": {
    "valid": true,
    "issues": [],
    "config": {
      "consentRetentionDays": 2555,
      "auditLogRetentionDays": 2555,
      "anonymizationRequired": true,
      "dataMinimization": true,
      "purposeLimitation": true,
      "storageLimitation": true,
      "accuracyRequirement": true,
      "securityMeasures": true,
      "accountability": true
    }
  }
}
```

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "consentType",
      "message": "\"consentType\" must be one of [necessary, functional, analytics, marketing, all]"
    }
  ]
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Consent record not found"
}
```

### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### Internal Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## DPDPA Compliance Features

1. **Data Minimization**: Only essential data is collected
2. **Purpose Limitation**: Clear purpose specification required
3. **Storage Limitation**: Automatic data expiration and cleanup
4. **Accuracy**: Data validation and integrity checks
5. **Security**: Secure data handling and storage
6. **Accountability**: Complete audit trail
7. **Anonymization**: Automatic anonymization of expired data
8. **Retention Management**: Configurable retention periods

## Example Usage

### Record Analytics Consent

```bash
curl -X POST http://localhost:5001/api/consent/record \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "consentType": "analytics",
    "consentStatus": "granted",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "purpose": "Website analytics and performance monitoring",
    "dataCategories": ["usage_data", "device_info", "browser_info"],
    "processingActivities": ["analytics", "performance_monitoring", "error_tracking"],
    "thirdPartySharing": true
  }'
```

### Retrieve User Consent History

```bash
curl "http://localhost:5001/api/consent/logs?userId=user123&limit=10"
```

### Withdraw Consent

```bash
curl -X PUT http://localhost:5001/api/consent/consent-id-here/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "withdrawn",
    "userId": "user123"
  }'
```
