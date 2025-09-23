export interface ConsentRecord {
  id: string;
  userId: string;
  sessionId: string;
  consentType: "necessary" | "functional" | "analytics" | "marketing" | "all";
  consentStatus: "granted" | "denied" | "withdrawn";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  consentVersion: string;
  dataRetentionPeriod: number; // in days
  purpose: string;
  legalBasis: string;
  dataController: string;
  dataProcessor: string;
  thirdPartySharing: boolean;
  dataCategories: string[];
  processingActivities: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isAnonymized: boolean;
  anonymizedAt?: Date;
}

export interface AuditLog {
  id: string;
  consentId: string;
  action:
    | "created"
    | "updated"
    | "withdrawn"
    | "anonymized"
    | "deleted"
    | "accessed";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: string;
  performedBy: string;
}

export interface ConsentRequest {
  userId: string;
  sessionId: string;
  consentType: ConsentRecord["consentType"];
  consentStatus: ConsentRecord["consentStatus"];
  ipAddress: string;
  userAgent: string;
  purpose: string;
  dataCategories: string[];
  processingActivities: string[];
  thirdPartySharing: boolean;
}

export interface ConsentResponse {
  success: boolean;
  message: string;
  consentId?: string;
  data?: ConsentRecord;
}

export interface LogsQuery {
  userId?: string;
  sessionId?: string;
  consentType?: ConsentRecord["consentType"];
  consentStatus?: ConsentRecord["consentStatus"];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  success: boolean;
  data: ConsentRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface DPDPAComplianceConfig {
  consentRetentionDays: number;
  auditLogRetentionDays: number;
  anonymizationRequired: boolean;
  dataMinimization: boolean;
  purposeLimitation: boolean;
  storageLimitation: boolean;
  accuracyRequirement: boolean;
  securityMeasures: boolean;
  accountability: boolean;
}
