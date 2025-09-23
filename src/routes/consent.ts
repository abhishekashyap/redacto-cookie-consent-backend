import { Router, Request, Response } from "express";
import { ConsentService } from "../services/consentService";
import {
  validateRequest,
  validateQuery,
  consentRequestSchema,
  logsQuerySchema,
} from "../middleware/validation";

export class ConsentRoutes {
  private router: Router;
  private consentService: ConsentService;

  constructor(consentService: ConsentService) {
    this.router = Router();
    this.consentService = consentService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Record consent
    this.router.post(
      "/record",
      validateRequest(consentRequestSchema),
      this.recordConsent.bind(this)
    );

    // Get consent records with filtering
    this.router.get(
      "/logs",
      validateQuery(logsQuerySchema),
      this.getConsentLogs.bind(this)
    );

    // Get specific consent record
    this.router.get("/:id", this.getConsentRecord.bind(this));

    // Update consent status
    this.router.put("/:id/status", this.updateConsentStatus.bind(this));

    // Get audit logs for a consent record
    this.router.get("/:id/audit", this.getAuditLogs.bind(this));

    // Data retention cleanup (admin endpoint)
    this.router.post("/admin/cleanup", this.performCleanup.bind(this));

    // Compliance validation (admin endpoint)
    this.router.get("/admin/compliance", this.validateCompliance.bind(this));
  }

  private async recordConsent(req: Request, res: Response): Promise<void> {
    try {
      const consentRecord = await this.consentService.recordConsent(req.body);

      res.status(201).json({
        success: true,
        message: "Consent recorded successfully",
        consentId: consentRecord.id,
        data: consentRecord,
      });
    } catch (error) {
      console.error("Error recording consent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to record consent",
      });
    }
  }

  private async getConsentLogs(req: Request, res: Response): Promise<void> {
    try {
      const { records, total } = await this.consentService.getConsentRecords(
        req.query
      );

      res.json({
        success: true,
        data: records,
        total,
        page:
          Math.floor(Number(req.query.offset) / Number(req.query.limit)) + 1,
        limit: req.query.limit,
      });
    } catch (error) {
      console.error("Error retrieving consent logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consent logs",
      });
    }
  }

  private async getConsentRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await this.consentService.getConsentRecordById(id);

      if (!record) {
        res.status(404).json({
          success: false,
          message: "Consent record not found",
        });
        return;
      }

      res.json({
        success: true,
        data: record,
      });
    } catch (error) {
      console.error("Error retrieving consent record:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consent record",
      });
    }
  }

  private async updateConsentStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["granted", "denied", "withdrawn"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid consent status",
        });
        return;
      }

      const record = await this.consentService.updateConsentStatus(
        id,
        status,
        req.body.userId || "system",
        req.clientIp || "unknown",
        req.userAgent || "unknown"
      );

      if (!record) {
        res.status(404).json({
          success: false,
          message: "Consent record not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Consent status updated successfully",
        data: record,
      });
    } catch (error) {
      console.error("Error updating consent status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update consent status",
      });
    }
  }

  private async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const auditLogs = await this.consentService.getAuditLogs(id);

      res.json({
        success: true,
        data: auditLogs,
      });
    } catch (error) {
      console.error("Error retrieving audit logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve audit logs",
      });
    }
  }

  private async performCleanup(req: Request, res: Response): Promise<void> {
    try {
      const { deleted, anonymized } =
        await this.consentService.performDataRetentionCleanup();

      res.json({
        success: true,
        message: "Data retention cleanup completed",
        deleted,
        anonymized,
      });
    } catch (error) {
      console.error("Error performing cleanup:", error);
      res.status(500).json({
        success: false,
        message: "Failed to perform cleanup",
      });
    }
  }

  private async validateCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { valid, issues } =
        await this.consentService.validateConsentIntegrity();
      const config = this.consentService.getComplianceConfig();

      res.json({
        success: true,
        compliance: {
          valid,
          issues,
          config,
        },
      });
    } catch (error) {
      console.error("Error validating compliance:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate compliance",
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
