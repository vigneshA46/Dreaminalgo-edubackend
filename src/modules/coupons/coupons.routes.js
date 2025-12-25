import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import * as couponService from './coupons.service.js';

const router = Router();

/* ================= ADMIN APIs ================= */

/* 1. Create Coupon */
router.post(
  '/',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const coupon = await couponService.createCoupon(req.body, req.user.id);
    res.json(coupon);
  }
);

/* 2. Update Coupon */
router.put(
  '/:id',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    res.json(coupon);
  }
);

/* 3. Disable Coupon */
router.delete(
  '/:id',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    await couponService.disableCoupon(req.params.id);
    res.json({ message: 'Coupon disabled' });
  }
);

/* 4. Get All Coupons */
router.get(
  '/',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const coupons = await couponService.getAllCoupons(req.query);
    res.json(coupons);
  }
);

/* 5. Get Coupon Details */
router.get(
  '/:id',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    const coupon = await couponService.getCouponById(req.params.id);
    res.json(coupon);
  }
);

/* 6. Assign Coupon to Courses */
router.post(
  '/:id/courses',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    await couponService.assignCourses(req.params.id, req.body.courseIds);
    res.json({ message: 'Courses assigned' });
  }
);

/* 7. Remove Coupon from Course */
router.delete(
  '/:id/courses/:courseId',
  authenticate,
  authorize('Super Admin', 'courseadmin'),
  async (req, res) => {
    await couponService.removeCourse(req.params.id, req.params.courseId);
    res.json({ message: 'Course removed' });
  }
);

/* ================= USER APIs ================= */

/* 8. Validate Coupon */
router.post(
  '/validate',
  authenticate,
  async (req, res) => {
    const result = await couponService.validateCoupon(
      req.body.code,
      req.body.courseid,
      req.user.id
    );
    res.json(result);
  }
);

/* 9. Apply Coupon */
router.post(
  '/apply',
  authenticate,
  async (req, res) => {
    const result = await couponService.applyCoupon(
      req.body.code,
      req.body.courseid
    );
    res.json(result);
  }
);

/* 10. Redeem Coupon (post-payment) */
router.post(
  '/redeem',
  authenticate,
  async (req, res) => {
    await couponService.redeemCoupon(
      req.body.couponid,
      req.user.id,
      req.body.paymentid
    );
    res.json({ message: 'Coupon redeemed' });
  }
);

/* ================= REPORTING APIs ================= */

/* 11. Coupon Usage Report */
router.get(
  '/:id/usage',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    const report = await couponService.getCouponUsage(req.params.id);
    res.json(report);
  }
);

/* 12. User Coupon History */
router.get(
  '/users/me/coupons',
  authenticate,
  async (req, res) => {
    const history = await couponService.getUserCoupons(req.user.id);
    res.json(history);
  }
);

export default router;
 