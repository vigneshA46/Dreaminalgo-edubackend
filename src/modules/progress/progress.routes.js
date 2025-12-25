import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import * as progressService from './progress.service.js';

const router = Router();

/* Update lesson progress */
router.post('/update', authenticate, async (req, res) => {
  const { lessonId, watchedSeconds, lessonDuration } = req.body;

  await progressService.updateLessonProgress(
    req.user.id,
    lessonId,
    watchedSeconds,
    lessonDuration
  );

  res.json({ message: 'Progress updated' });
});

/* Get lesson progress */
router.get('/lesson/:lessonId', authenticate, async (req, res) => {
  const data = await progressService.getLessonProgress(
    req.user.id,
    req.params.lessonId
  );

  res.json(data);
});

/* Get course progress */
router.get('/course/:courseId', authenticate, async (req, res) => {
  const data = await progressService.getCourseProgress(
    req.user.id,
    req.params.courseId
  );

  res.json(data);
});

export default router;
