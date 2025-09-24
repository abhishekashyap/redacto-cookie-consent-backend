import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

// Rate limiting middleware
export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    },
  });
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// CORS configuration
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const corsOrigin = process.env.CORS_ORIGIN;

    // If CORS_ORIGIN is set to "*", allow all origins
    if (corsOrigin === "*") {
      return callback(null, true);
    }

    // If CORS_ORIGIN is not set, allow common development origins
    if (!corsOrigin) {
      const defaultOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5000",
        "http://localhost:5001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
      ];

      if (defaultOrigins.includes(origin)) {
        return callback(null, true);
      }
    } else {
      // Parse comma-separated origins
      const allowedOrigins = corsOrigin.split(",").map((o) => o.trim());

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // In development, be more permissive
    if (process.env.NODE_ENV === "development") {
      console.warn(`CORS: Allowing origin ${origin} in development mode`);
      return callback(null, true);
    }

    // In production, be strict
    console.error(`CORS: Blocked origin ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
};

// Extend Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      clientIp?: string;
      userAgent?: string;
    }
  }
}

// IP address extraction middleware
export const extractClientInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? typeof forwarded === "string"
      ? forwarded.split(",")[0]
      : forwarded[0]
    : req.connection.remoteAddress || req.socket.remoteAddress || "unknown";

  req.clientIp = ip;
  req.userAgent = req.headers["user-agent"] || "unknown";
  next();
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.clientIp}`
    );
  });

  next();
};

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
};
