import path from "path";
import fs from "fs";
import { ConsentRecord, AuditLog } from "../types";

export class ConsentDatabase {
  private dbPath: string;
  private consentRecords: ConsentRecord[] = [];
  private auditLogs: AuditLog[] = [];

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.ensureDirectoryExists();
    this.loadData();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      const consentPath = this.getConsentRecordsPath();
      const auditPath = this.getAuditLogsPath();

      if (fs.existsSync(consentPath)) {
        const data = fs.readFileSync(consentPath, "utf8");
        this.consentRecords = JSON.parse(data);
      }

      if (fs.existsSync(auditPath)) {
        const data = fs.readFileSync(auditPath, "utf8");
        this.auditLogs = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading database:", error);
      this.consentRecords = [];
      this.auditLogs = [];
    }
  }

  private saveData(): void {
    try {
      const consentPath = this.getConsentRecordsPath();
      const auditPath = this.getAuditLogsPath();

      fs.writeFileSync(
        consentPath,
        JSON.stringify(this.consentRecords, null, 2)
      );
      fs.writeFileSync(auditPath, JSON.stringify(this.auditLogs, null, 2));
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  private getConsentRecordsPath(): string {
    return path.join(path.dirname(this.dbPath), "consent_records.json");
  }

  private getAuditLogsPath(): string {
    return path.join(path.dirname(this.dbPath), "audit_logs.json");
  }

  async createConsentRecord(record: ConsentRecord): Promise<void> {
    this.consentRecords.push(record);
    this.saveData();
  }

  async getConsentRecords(query: any): Promise<ConsentRecord[]> {
    let records = [...this.consentRecords];

    if (query.userId) {
      records = records.filter((r) => r.userId === query.userId);
    }

    if (query.sessionId) {
      records = records.filter((r) => r.sessionId === query.sessionId);
    }

    if (query.consentType) {
      records = records.filter((r) => r.consentType === query.consentType);
    }

    if (query.consentStatus) {
      records = records.filter((r) => r.consentStatus === query.consentStatus);
    }

    if (query.startDate) {
      records = records.filter((r) => r.timestamp >= query.startDate);
    }

    if (query.endDate) {
      records = records.filter((r) => r.timestamp <= query.endDate);
    }

    // Sort by timestamp descending
    records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (query.offset) {
      records = records.slice(query.offset);
    }

    if (query.limit) {
      records = records.slice(0, query.limit);
    }

    return records;
  }

  async getConsentRecordById(id: string): Promise<ConsentRecord | null> {
    return this.consentRecords.find((r) => r.id === id) || null;
  }

  async updateConsentRecord(
    id: string,
    updates: Partial<ConsentRecord>
  ): Promise<void> {
    const index = this.consentRecords.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.consentRecords[index] = {
        ...this.consentRecords[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveData();
    }
  }

  async createAuditLog(log: AuditLog): Promise<void> {
    this.auditLogs.push(log);
    this.saveData();
  }

  async getAuditLogs(consentId: string): Promise<AuditLog[]> {
    return this.auditLogs
      .filter((log) => log.consentId === consentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async deleteExpiredRecords(): Promise<number> {
    const now = new Date();
    const initialCount = this.consentRecords.length;

    this.consentRecords = this.consentRecords.filter((r) => r.expiresAt > now);

    const deletedCount = initialCount - this.consentRecords.length;
    if (deletedCount > 0) {
      this.saveData();
    }

    return deletedCount;
  }

  async anonymizeExpiredRecords(): Promise<number> {
    const now = new Date();
    let anonymizedCount = 0;

    this.consentRecords = this.consentRecords.map((record) => {
      if (record.expiresAt <= now && !record.isAnonymized) {
        anonymizedCount++;
        return {
          ...record,
          isAnonymized: true,
          anonymizedAt: new Date(),
          userId: `anonymized_${record.userId.substring(0, 8)}`,
          ipAddress: "anonymized",
          userAgent: "anonymized",
        };
      }
      return record;
    });

    if (anonymizedCount > 0) {
      this.saveData();
    }

    return anonymizedCount;
  }

  async close(): Promise<void> {
    // No-op for JSON file database
  }
}
