import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './db.js';
import { errorHandler } from './middleware/error-handler.js';
import panelsRouter from './routes/panels.js';
import rowsRouter from './routes/rows.js';
import fusesRouter from './routes/fuses.js';
import junctionBoxesRouter from './routes/junction-boxes.js';
import socketsRouter from './routes/sockets.js';
import devicesRouter from './routes/devices.js';
import roomsRouter from './routes/rooms.js';
import exportRouter from './routes/export.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/panels', panelsRouter);
app.use('/api/rows', rowsRouter);
app.use('/api/fuses', fusesRouter);
app.use('/api/junction-boxes', junctionBoxesRouter);
app.use('/api/sockets', socketsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api', exportRouter);

// Serve static files in production
if (isProduction) {
  const clientPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
