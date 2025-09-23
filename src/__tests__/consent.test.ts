import request from "supertest";
import { App } from "../app";

describe("Consent API", () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    app = new App();
    server = app.getApp();
  });

  afterAll(async () => {
    await app.shutdown();
  });

  describe("POST /api/consent/record", () => {
    it("should record consent successfully", async () => {
      const consentData = {
        userId: "test-user-123",
        sessionId: "test-session-456",
        consentType: "analytics",
        consentStatus: "granted",
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
        purpose: "Website analytics and performance monitoring",
        dataCategories: ["usage_data", "device_info"],
        processingActivities: ["analytics", "performance_monitoring"],
        thirdPartySharing: true,
      };

      const response = await request(server)
        .post("/api/consent/record")
        .send(consentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.consentId).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.consentType).toBe("analytics");
      expect(response.body.data.consentStatus).toBe("granted");
    });

    it("should reject invalid consent data", async () => {
      const invalidData = {
        userId: "", // Invalid: empty string
        sessionId: "test-session",
        consentType: "invalid-type", // Invalid: not in allowed values
        consentStatus: "granted",
        ipAddress: "127.0.0.1",
        userAgent: "Test Browser",
        purpose: "Test purpose",
        dataCategories: [],
        processingActivities: [],
        thirdPartySharing: true,
      };

      const response = await request(server)
        .post("/api/consent/record")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /api/consent/logs", () => {
    it("should retrieve consent logs", async () => {
      const response = await request(server)
        .get("/api/consent/logs")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter logs by userId", async () => {
      const response = await request(server)
        .get("/api/consent/logs?userId=test-user-123")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(server).get("/health").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("running");
    });
  });
});
