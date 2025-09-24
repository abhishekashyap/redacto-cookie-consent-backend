import { v4 as uuidv4 } from "uuid";
import { ConsentDatabase } from "../config/database";
import {
  ConsentRecord,
  ConsentRequest,
  AuditLog,
  DPDPAComplianceConfig,
} from "../types";

export class ConsentService {
  private db: ConsentDatabase;
  private complianceConfig: DPDPAComplianceConfig;

  constructor(db: ConsentDatabase) {
    this.db = db;
    this.complianceConfig = {
      consentRetentionDays: parseInt(
        process.env.CONSENT_RETENTION_DAYS || "2555"
      ),
      auditLogRetentionDays: parseInt(
        process.env.AUDIT_LOG_RETENTION_DAYS || "2555"
      ),
      anonymizationRequired: true,
      dataMinimization: true,
      purposeLimitation: true,
      storageLimitation: true,
      accuracyRequirement: true,
      securityMeasures: true,
      accountability: true,
    };
  }

  async recordConsent(request: ConsentRequest): Promise<ConsentRecord> {
    const consentId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() +
        this.complianceConfig.consentRetentionDays * 24 * 60 * 60 * 1000
    );

    const consentRecord: ConsentRecord = {
      id: consentId,
      userId: request.userId,
      sessionId: request.sessionId,
      currentorgid: request.currentorgid,
      consentType: request.consentType,
      consentStatus: request.consentStatus,
      timestamp: now,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      consentVersion: "1.0.0",
      dataRetentionPeriod: this.complianceConfig.consentRetentionDays,
      purpose: request.purpose,
      legalBasis: this.getLegalBasis(request.consentType),
      dataController: process.env.DATA_CONTROLLER || "Redacto Cookie Consent",
      dataProcessor:
        process.env.DATA_PROCESSOR || "Redacto Cookie Consent Backend",
      thirdPartySharing: request.thirdPartySharing,
      dataCategories: request.dataCategories,
      processingActivities: request.processingActivities,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      isAnonymized: false,
    };

    await this.db.createConsentRecord(consentRecord);

    // Create audit log
    const auditLog: AuditLog = {
      id: uuidv4(),
      consentId,
      action: "created",
      timestamp: now,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      details: `Consent ${request.consentStatus} for ${request.consentType} cookies`,
      performedBy: request.userId,
    };

    await this.db.createAuditLog(auditLog);

    return consentRecord;
  }

  async getConsentRecords(
    query: any
  ): Promise<{ records: ConsentRecord[]; total: number }> {
    const records = await this.db.getConsentRecords(query);

    // Get total count for pagination
    const countQuery = { ...query };
    delete countQuery.limit;
    delete countQuery.offset;
    const allRecords = await this.db.getConsentRecords(countQuery);

    return {
      records,
      total: allRecords.length,
    };
  }

  async getConsentRecordById(id: string): Promise<ConsentRecord | null> {
    const record = await this.db.getConsentRecordById(id);

    if (record) {
      // Create audit log for access
      const auditLog: AuditLog = {
        id: uuidv4(),
        consentId: id,
        action: "accessed",
        timestamp: new Date(),
        ipAddress: "system",
        userAgent: "system",
        details: "Consent record accessed",
        performedBy: "system",
      };

      await this.db.createAuditLog(auditLog);
    }

    return record;
  }

  async updateConsentStatus(
    id: string,
    newStatus: "granted" | "denied" | "withdrawn",
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<ConsentRecord | null> {
    const existingRecord = await this.db.getConsentRecordById(id);

    if (!existingRecord) {
      return null;
    }

    const updates: Partial<ConsentRecord> = {
      consentStatus: newStatus,
      updatedAt: new Date(),
    };

    await this.db.updateConsentRecord(id, updates);

    // Create audit log
    const auditLog: AuditLog = {
      id: uuidv4(),
      consentId: id,
      action: newStatus === "withdrawn" ? "withdrawn" : "updated",
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: `Consent status changed to ${newStatus}`,
      performedBy: userId,
    };

    await this.db.createAuditLog(auditLog);

    return await this.db.getConsentRecordById(id);
  }

  async getAuditLogs(consentId: string): Promise<AuditLog[]> {
    return await this.db.getAuditLogs(consentId);
  }

  async performDataRetentionCleanup(): Promise<{
    deleted: number;
    anonymized: number;
  }> {
    const deleted = await this.db.deleteExpiredRecords();
    const anonymized = await this.db.anonymizeExpiredRecords();

    return { deleted, anonymized };
  }

  private getLegalBasis(consentType: string): string {
    switch (consentType) {
      case "necessary":
        return "Legitimate interest - essential for website functionality";
      case "functional":
        return "Consent - enhances user experience";
      case "analytics":
        return "Consent - website analytics and performance monitoring";
      case "marketing":
        return "Consent - targeted advertising and marketing";
      case "all":
        return "Consent - all cookie categories";
      default:
        return "Consent";
    }
  }

  getComplianceConfig(): DPDPAComplianceConfig {
    return this.complianceConfig;
  }

  async validateConsentIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check for records without proper expiration
      const allRecords = await this.db.getConsentRecords({});
      const now = new Date();

      for (const record of allRecords) {
        if (record.expiresAt <= now && !record.isAnonymized) {
          issues.push(`Record ${record.id} has expired but is not anonymized`);
        }

        if (
          record.dataRetentionPeriod >
          this.complianceConfig.consentRetentionDays
        ) {
          issues.push(
            `Record ${record.id} has retention period exceeding compliance limit`
          );
        }
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Database integrity check failed: ${error}`);
      return {
        valid: false,
        issues,
      };
    }
  }
}
