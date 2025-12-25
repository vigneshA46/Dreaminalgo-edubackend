import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../../config/db.js';
import { validateCoupon } from '../coupons/coupons.service.js';
import { enrollCourse } from '../enrollments/enrollments.service.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= CREATE PAYMENT ================= */
export const createPayment = async (userId, courseId, couponCode) => {
  /* 1. Fetch course */
  const courseRes = await pool.query(
    'SELECT price, isfree FROM courses WHERE id=$1 AND status=$2',
    [courseId, 'published']
  );

  if (!courseRes.rows.length) {
    throw new Error('Course not found');
  }

  let amount = Number(courseRes.rows[0].price);
  let coupon = null;

  /* 2. Coupon validation (optional) */
  if (couponCode) {
    coupon = await validateCoupon(couponCode, courseId, userId);
    amount = amount - (amount * coupon.discountpercentage) / 100;
  }

  if (amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  /* 3. Create Razorpay order FIRST */
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt: paymentRes.rows[0].id`
  });

  /* 4. Insert payment AFTER Razorpay success */
  const paymentRes = await pool.query(
    `INSERT INTO payments (userid, courseid, amount, currency, status, provider)
     VALUES ($1,$2,$3,'INR','created','razorpay')
     RETURNING id`,
    [userId, courseId, amount]
  );

  return {
    razorpayOrderId: order.id,
    amount,
    currency: 'INR',
    paymentId: paymentRes.rows[0].id,
    key: process.env.RAZORPAY_KEY_ID
  };
};

/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = async (userId, data) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentId,
    couponCode
  } = data;

  /* 1. Verify signature */
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new Error('Payment verification failed');
  }

  /* 2. Fetch payment */
  const paymentRes = await pool.query(
    'SELECT * FROM payments WHERE id=$1 AND userid=$2',
    [paymentId, userId]
  );

  if (!paymentRes.rows.length) {
    throw new Error('Payment not found');
  }

  if (paymentRes.rows[0].status === 'success') {
    return;
  }

  const courseId = paymentRes.rows[0].courseid;

  /* 3. Mark payment success */
  await pool.query(
    `UPDATE payments SET status='success' WHERE id=$1`,
    [paymentId]
  );

  /* 4. Redeem coupon (if used) */
  if (couponCode) {
    const couponRes = await pool.query(
      'SELECT id FROM coupons WHERE code=$1',
      [couponCode]
    );

    if (couponRes.rows.length) {
      await pool.query(
        `INSERT INTO couponredemptions (couponid, userid, paymentid)
         VALUES ($1,$2,$3)`,
        [couponRes.rows[0].id, userId, paymentId]
      );

      await pool.query(
        `UPDATE coupons SET usedcount = usedcount + 1 WHERE id=$1`,
        [couponRes.rows[0].id]
      );
    }
  }

  /* 5. Enroll user */
  await enrollCourse(userId, courseId);
};

/* ================= FAILURE ================= */
export const markPaymentFailed = async (paymentId) => {
  await pool.query(
    `UPDATE payments SET status='failed' WHERE id=$1`,
    [paymentId]
  );
};
