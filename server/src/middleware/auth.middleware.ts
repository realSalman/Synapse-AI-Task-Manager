import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

/**
 * Verifies Firebase ID token from the Authorization header.
 * Attaches the decoded token as `req.user` on success.
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
