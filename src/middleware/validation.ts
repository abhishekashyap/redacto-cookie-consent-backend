import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const consentRequestSchema = Joi.object({
  userId: Joi.string().required().min(1).max(255),
  sessionId: Joi.string().required().min(1).max(255),
  currentorgid: Joi.string().required().min(1).max(255),
  consentType: Joi.string()
    .valid("necessary", "functional", "analytics", "marketing", "all")
    .required(),
  consentStatus: Joi.string()
    .valid("granted", "denied", "withdrawn")
    .required(),
  ipAddress: Joi.string().ip().required(),
  userAgent: Joi.string().required().max(1000),
  purpose: Joi.string().required().min(1).max(500),
  dataCategories: Joi.array().items(Joi.string()).required().min(1),
  processingActivities: Joi.array().items(Joi.string()).required().min(1),
  thirdPartySharing: Joi.boolean().required(),
});

export const logsQuerySchema = Joi.object({
  userId: Joi.string().optional().min(1).max(255),
  sessionId: Joi.string().optional().min(1).max(255),
  currentorgid: Joi.string().optional().min(1).max(255),
  consentType: Joi.string()
    .valid("necessary", "functional", "analytics", "marketing", "all")
    .optional(),
  consentStatus: Joi.string()
    .valid("granted", "denied", "withdrawn")
    .optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  limit: Joi.number().integer().min(1).max(1000).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
});

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    return next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Query validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.query = value;
    return next();
  };
};
