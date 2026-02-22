import dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { mkdirSync } from 'fs';
import designRoutes from './routes/design.routes';

const PORT = process.env.PORT ?? '3001';
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/svg-viewer';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5174';
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? './uploads';

mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/designs', designRoutes);

const connectToDatabase = async (): Promise<void> => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
};

const startServer = async (): Promise<void> => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });
};

startServer().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
