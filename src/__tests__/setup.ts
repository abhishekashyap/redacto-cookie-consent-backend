// Test setup file
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = ":memory:"; // Use in-memory database for tests
