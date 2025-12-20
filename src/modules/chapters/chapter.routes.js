import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import * as chapterService from './chapter.service.js';

const router = Router();

/* =========================
   ADMIN APIS
========================= */

/* CREATE CHAPTER */
router.post(
  '/',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    const chapter = await chapterService.createChapter(req.body);
    res.json(chapter);
  }
);

/* UPDATE CHAPTER */
router.put(
  '/',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    const chapter = await chapterService.updateChapter(req.body);
    res.json(chapter);
  }
);

/* DELETE CHAPTER */
router.delete(
  '/',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    await chapterService.deleteChapter(req.body.id);
    res.json({ message: 'Chapter deleted successfully' });
  }
);

/* GET ALL CHAPTERS OF A COURSE (ADMIN) */
router.post(
  '/by-course',
  authenticate,
  async (req, res) => {
    const chapters = await chapterService.getChaptersByCourse(req.body.courseid);
    res.json(chapters);
  }
);

/* REORDER CHAPTERS */
router.put(
  '/reorder',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    await chapterService.reorderChapters(req.body.courseid, req.body.chapters);
    res.json({ message: 'Chapters reordered successfully' });
  }
);


export default router;
