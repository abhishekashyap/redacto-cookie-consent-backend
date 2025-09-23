import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import { ConsentDatabase } from "./config/database";
import { ConsentService } from "./services/consentService";
import { ConsentRoutes } from "./routes/consent";
import {
  securityHeaders,
  corsOptions,
  extractClientInfo,
  requestLogger,
  errorHandler,
  notFound,
  createRateLimit,
} from "./middleware/security";

// Load environment variables
dotenv.config();

export class App {
  private app: express.Application;
  private db: ConsentDatabase;
  private consentService: ConsentService;

  constructor() {
    this.app = express();
    this.db = new ConsentDatabase(
      process.env.DATABASE_PATH || "./data/consent.db"
    );
    this.consentService = new ConsentService(this.db);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(securityHeaders);
    this.app.use(cors(corsOptions));
    this.app.use(compression());

    // Rate limiting
    const rateLimitWindow = parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || "900000"
    );
    const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100");
    this.app.use(createRateLimit(rateLimitWindow, rateLimitMax));

    // Request parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Custom middleware
    this.app.use(extractClientInfo);
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        success: true,
        message: "Cookie Consent Backend is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    });

    // API routes
    const consentRoutes = new ConsentRoutes(this.consentService);
    this.app.use("/api/consent", consentRoutes.getRouter());

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Redacto Cookie Consent Backend API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          consent: "/api/consent",
          documentation: "/api/docs",
        },
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async start(): Promise<void> {
    const port = process.env.PORT || 5001;

    this.app.listen(port, () => {
      console.log(`🚀 Cookie Consent Backend running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔒 API endpoints: http://localhost:${port}/api/consent`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }

  public async shutdown(): Promise<void> {
    console.log("🛑 Shutting down server...");
    this.db.close();
    process.exit(0);
  }
}
