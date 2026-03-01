import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

/* 👉 IMPORT ROUTES */
import authRoutes from './modules/auth/auth.routes.js';
import authAdmin from './modules/admin-auth/admin.auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import userRoutes from './modules/users/users.routes.js';
import courseRoutes from './modules/courses/course.routes.js';
import chapterRoutes from './modules/chapters/chapter.routes.js';
import lessonRoutes from './modules/lessons/lesson.routes.js';
import enrollmentRoutes from './modules/enrollments/enrollments.routes.js';
import announcementRoutes from './modules/announcements/announcements.routes.js';
import couponsRoutes from './modules/coupons/coupons.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import progressRoutes from './modules/progress/progress.routes.js';


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
    origin: true,   // allow all origins
    credentials: true,
  })
);

/* Parsers */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* 👉 ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth',authAdmin);
app.use('/api/admin',adminRoutes);
app.use('/api/users',userRoutes);
app.use('/api/courses',courseRoutes);
app.use('/api/chapters',chapterRoutes);
app.use('/api/lessons',lessonRoutes);
app.use('/api/enrollments',enrollmentRoutes);
app.use('/api/announcements',announcementRoutes);
app.use('/api/coupons',couponsRoutes);
app.use('/api/payments',paymentRoutes);
app.use('/api/progress',progressRoutes);

/* Health Check */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default app;
 