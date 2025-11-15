import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Security middleware configuration
 */

// Helmet helps secure Express apps by setting various HTTP headers
export const helmetMiddleware = helmet();

// Sanitize data to prevent MongoDB Operator Injection
export const mongoSanitizeMiddleware = mongoSanitize();

// Prevent HTTP Parameter Pollution attacks
export const hppMiddleware = hpp();
