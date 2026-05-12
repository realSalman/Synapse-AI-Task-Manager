import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import usersRouter from './routes/users.routes';
import boardsRouter from './routes/boards.routes';
import aiRouter from './routes/ai.routes';

import admin from 'firebase-admin';
import path from 'path';

// ─── Firebase Admin Initialization ───────────────────────────────────────────
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(path.resolve(serviceAccountPath)),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not found in .env. Firebase Auth will not work.');
}

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', usersRouter);
app.use('/api', boardsRouter);
app.use('/api/ai', aiRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});
