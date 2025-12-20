import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import * as enrollmentService from './enrollments.service.js';

const router = Router();

/* USER: Enroll in a course */
router.post(
  '/enroll',
  authenticate,
  async (req, res) => {
    const enrollment = await enrollmentService.enrollCourse(
      req.user.id,
      req.body.courseid
    );
    res.json(enrollment);
  }
);

/* USER: Check enrollment status */
router.post(
  '/status',
  authenticate,
  async (req, res) => {
    const status = await enrollmentService.checkEnrollment(
      req.user.id,
      req.body.courseid
    );
    res.json(status);
  }
);

/* USER: Get my enrolled courses */
router.get(
  '/my-courses',
  authenticate,
  async (req, res) => {
    const courses = await enrollmentService.getMyEnrollments(req.user.id);
    res.json(courses);
  }
);

/* ADMIN: Get enrollments by course */
router.post(
  '/by-course',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const enrollments = await enrollmentService.getEnrollmentsByCourse(
      req.body.courseid
    );
    res.json(enrollments);
  }
);

/* ADMIN: Manually enroll user */
router.post(
  '/admin/enroll-user',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const enrollment = await enrollmentService.adminEnrollUser(
      req.body.userid,
      req.body.courseid
    );
    res.json(enrollment);
  }
);

/* ADMIN: Revoke enrollment */
router.post(
  '/admin/revoke',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    await enrollmentService.revokeEnrollment(
      req.body.userid,
      req.body.courseid
    );
    res.json({ message: 'Enrollment revoked successfully' });
  }
);

export default router;
