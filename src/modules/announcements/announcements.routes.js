import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import * as announcementService from './announcements.service.js';

const router = Router();

/* =========================
   ADMIN ROUTES
========================= */

/* Create announcement */
router.post(
  '/',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const announcement = await announcementService.createAnnouncement(req.body);
    res.json(announcement);
  }
);

/* Update announcement */
router.put(
  '/',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const announcement = await announcementService.updateAnnouncement(req.body);
    res.json(announcement);
  }
);

/* Deactivate announcement */
router.post(
  '/deactivate',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    await announcementService.deactivateAnnouncement(req.body.id);
    res.json({ message: 'Announcement deactivated' });
  }
);

/* Get all announcements (admin view) */
router.get(
  '/admin/all',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const announcements = await announcementService.getAllAnnouncementsAdmin();
    res.json(announcements);
  }
);

/* Get single announcement (admin) */
router.post(
  '/admin/single',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const announcement = await announcementService.getAnnouncementById(req.body.id);
    res.json(announcement);
  }
);

/* =========================
   USER ROUTES
========================= */

/* Get active announcements (global + course) */
router.post(
  '/active',
  authenticate,
  async (req, res) => {
    const courseid = req.body?.courseid || null;

    const announcements =
      await announcementService.getActiveAnnouncements(courseid);

    res.json(announcements);
  }
);

/* Get course-specific announcements */
router.post(
  '/course',
  authenticate,
  async (req, res) => {
    const announcements = await announcementService.getCourseAnnouncements(
      req.body.courseid
    );
    res.json(announcements);
  }
);

export default router;
