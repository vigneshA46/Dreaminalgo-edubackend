import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import * as courseService from './course.service.js';

const router = Router();

/* CREATE COURSE (Admin) */
router.post(
  '/',
  authenticate,
  authorize('superadmin', 'courseadmin'),
  async (req, res) => {
    const course = await courseService.createCourse(req.body, req.user.id);
    res.json(course);
  }
);

/* UPDATE COURSE (Admin) – course id in body */
router.put(
  '/',
  authenticate,
  authorize('superadmin', 'courseadmin'),
  async (req, res) => {
    const course = await courseService.updateCourse(req.body);
    res.json(course);
  }
);

/* DELETE COURSE (Admin) – course id in body */
router.delete(
  '/',
  authenticate,
  authorize('superadmin'),
  async (req, res) => {
    await courseService.deleteCourse(req.body.id);
    res.json({ message: 'Course deleted successfully' });
  }
);

/* GET SINGLE COURSE – id in body */
router.post(
  '/single',
  authenticate,
  async (req, res) => {
    const course = await courseService.getCourseById(req.body.id);
    res.json(course);
  }
);

/* GET ALL COURSES (Admin) */
router.post(
  '/all',
  authenticate,
  authorize('superadmin'),
  async (req, res) => {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  }
);

/* GET COURSES BY STATUS (Admin / User) 
   Body: { status: 'draft' | 'published' | 'archived' }
*/
router.post(
  '/by-status',
  authenticate,
  async (req, res) => {
    const { status } = req.body;
    const courses = await courseService.getCoursesByStatus(status);
    res.json(courses);
  }
);

router.get(
  '/:category',
  authenticate,
  async (req, res) => {
    const {category} = req.params;
    const course = await courseService.getCoursesByCategory(category);
    res.json(course);
  }
);

router.get(
  '/:category/:status',
  authenticate,
  async (req, res) => {
    const {category , status} = req.params;
    const course = await courseService.getCoursesByCategory(category , status);
    res.json(course);
  }
);


export default router;
