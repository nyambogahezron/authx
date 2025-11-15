import { Request } from 'express';
import crypto from 'crypto';
import UAParser from 'ua-parser-js';

/**
 * Generate a device fingerprint based on request headers and IP
 */
export function generateDeviceFingerprint(req: Request): string {
  const parser = new UAParser.UAParser(req.headers['user-agent']);
  const deviceInfo = {
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    browser: parser.getBrowser().name || 'unknown',
    os: parser.getOS().name || 'unknown',
    device: parser.getDevice().type || 'desktop',
  };

  const fingerprintString = JSON.stringify(deviceInfo);
  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
}

/**
 * Parse device information from request
 */
export function parseDeviceInfo(req: Request) {
  const parser = new UAParser.UAParser(req.headers['user-agent']);
  
  return {
    fingerprint: generateDeviceFingerprint(req),
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    browser: {
      name: parser.getBrowser().name || 'unknown',
      version: parser.getBrowser().version || 'unknown',
    },
    os: {
      name: parser.getOS().name || 'unknown',
      version: parser.getOS().version || 'unknown',
    },
    device: {
      type: parser.getDevice().type || 'desktop',
      vendor: parser.getDevice().vendor || 'unknown',
      model: parser.getDevice().model || 'unknown',
    },
  };
}
