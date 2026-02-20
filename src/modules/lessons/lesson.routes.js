import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import * as lessonService from './lesson.service.js';

const router = Router();

/* =========================
   ADMIN APIS
========================= */

/* CREATE LESSON */
router.post(
  '/',
  authenticate,
  authorize('superadmin', 'courseadmin'),
  async (req, res) => {
    const lesson = await lessonService.createLesson(req.body);
    res.json(lesson);
  }
);

/* UPDATE LESSON */
router.put(
  '/',
  authenticate,
  authorize('superadmin', 'courseadmin'),
  async (req, res) => {
    const lesson = await lessonService.updateLesson(req.body);
    res.json(lesson);
  }
);

/* DELETE LESSON */
router.delete(
  '/',
  authenticate,
  authorize('superadmin', 'courseadmin'),
  async (req, res) => {
    await lessonService.deleteLesson(req.body.id);
    res.json({ message: 'Lesson deleted successfully' });
  }
);

/* GET LESSONS BY CHAPTER (ADMIN) */
router.post(
  '/by-chapter',
  authenticate,
  async (req, res) => {
    const lessons = await lessonService.getLessonsByChapter(req.body.chapterid);
    res.json(lessons);
  }
);

/* REORDER LESSONS */
router.put(
  '/reorder',
  authenticate,
  authorize('superadmin', 'courseadmin'),
  async (req, res) => {
    await lessonService.reorderLessons(req.body.chapterid, req.body.lessons);
    res.json({ message: 'Lessons reordered successfully' });
  }
);


router.post(
  '/single',
  authenticate,
  async (req, res) => {
    const lesson = await lessonService.getSingleLessonForUser(
      req.body.lessonid,
      req.user.id
    );
    res.json(lesson);
  }
);


export default router;
