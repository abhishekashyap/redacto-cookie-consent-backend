# Redacto Cookie Consent Backend

A DPDPA (Data Protection and Privacy Act) compliant Node.js TypeScript backend server for managing cookie consent records and data logs.

## Features

- **DPDPA Compliance**: Full compliance with data protection regulations
- **Consent Management**: Record, retrieve, and manage cookie consent
- **Data Retention**: Automatic data retention and anonymization
- **Audit Trail**: Complete audit logging for all consent operations
- **Security**: Rate limiting, CORS, security headers, and input validation
- **TypeScript**: Full TypeScript support with strict type checking
- **SQLite Database**: Lightweight, file-based database for consent storage

## DPDPA Compliance Features

- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Clear purpose specification for data processing
- **Storage Limitation**: Automatic data expiration and cleanup
- **Accuracy**: Data validation and integrity checks
- **Security**: Encryption and secure data handling
- **Accountability**: Complete audit trail and compliance monitoring
- **Anonymization**: Automatic anonymization of expired data
- **Retention Management**: Configurable data retention periods

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd redacto-cookie-consent-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env
# Edit .env with your configuration
```

4. Build the project:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

## Environment Configuration

Create a `.env` file based on `env.example`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./data/consent.db

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Data Retention (in days)
CONSENT_RETENTION_DAYS=2555
AUDIT_LOG_RETENTION_DAYS=2555

# CORS Configuration
CORS_ORIGIN=http://localhost:5001

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Consent Management

- `POST /api/consent/record` - Record new consent
- `GET /api/consent/logs` - Retrieve consent logs with filtering
- `GET /api/consent/:id` - Get specific consent record
- `PUT /api/consent/:id/status` - Update consent status
- `GET /api/consent/:id/audit` - Get audit logs for consent record

### Admin Endpoints

- `POST /api/consent/admin/cleanup` - Perform data retention cleanup
- `GET /api/consent/admin/compliance` - Validate compliance status

## API Usage Examples

### Record Consent

```bash
curl -X POST http://localhost:5001/api/consent/record \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "consentType": "analytics",
    "consentStatus": "granted",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "purpose": "Website analytics and performance monitoring",
    "dataCategories": ["usage_data", "device_info"],
    "processingActivities": ["analytics", "performance_monitoring"],
    "thirdPartySharing": true
  }'
```

### Retrieve Consent Logs

```bash
curl "http://localhost:5001/api/consent/logs?userId=user123&limit=10&offset=0"
```

### Update Consent Status

```bash
curl -X PUT http://localhost:5001/api/consent/consent-id/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "withdrawn",
    "userId": "user123"
  }'
```

## Database Schema

### Consent Records Table

- `id` - Unique consent record identifier
- `user_id` - User identifier
- `session_id` - Session identifier
- `consent_type` - Type of consent (necessary, functional, analytics, marketing, all)
- `consent_status` - Status (granted, denied, withdrawn)
- `timestamp` - When consent was recorded
- `ip_address` - Client IP address
- `user_agent` - Client user agent
- `consent_version` - Version of consent mechanism
- `data_retention_period` - Retention period in days
- `purpose` - Purpose of data processing
- `legal_basis` - Legal basis for processing
- `data_controller` - Data controller information
- `data_processor` - Data processor information
- `third_party_sharing` - Whether data is shared with third parties
- `data_categories` - Categories of data collected
- `processing_activities` - Processing activities performed
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp
- `expires_at` - Record expiration timestamp
- `is_anonymized` - Whether record has been anonymized
- `anonymized_at` - Anonymization timestamp

### Audit Logs Table

- `id` - Unique audit log identifier
- `consent_id` - Reference to consent record
- `action` - Action performed (created, updated, withdrawn, anonymized, deleted, accessed)
- `timestamp` - When action was performed
- `ip_address` - IP address of actor
- `user_agent` - User agent of actor
- `details` - Action details
- `performed_by` - Who performed the action

## DPDPA Compliance

This backend implements the following DPDPA compliance measures:

1. **Lawfulness, Fairness, and Transparency**: Clear consent mechanisms and transparent data processing
2. **Purpose Limitation**: Specific purposes for data collection and processing
3. **Data Minimization**: Only collect necessary data for stated purposes
4. **Accuracy**: Data validation and integrity checks
5. **Storage Limitation**: Automatic data expiration and cleanup
6. **Security**: Encryption, secure storage, and access controls
7. **Accountability**: Complete audit trail and compliance monitoring

## Security Features

- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Security headers (Helmet.js)
- Input validation and sanitization
- IP address logging and tracking
- Secure database operations
- Error handling without information leakage

## Development

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
src/
├── config/          # Database and configuration
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── app.ts           # Express app setup
└── index.ts         # Application entry point
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions, please open an issue in the repository.
