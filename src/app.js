import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

/* 👉 IMPORT ROUTES */
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

/* Security */
app.use(helmet());

/* Logging */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* CORS */
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);

/* Parsers */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* 👉 ROUTES */
app.use('/api/auth', authRoutes);

/* Health Check */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default app;
