import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import * as paymentService from './payments.service.js';

const router = Router();

/* Create payment */
router.post('/create', authenticate, async (req, res) => {
  try {
    const data = await paymentService.createPayment(
      req.user.id,
      req.body.courseid,
      req.body.couponCode || null
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

/* Verify payment */
router.post('/verify', authenticate, async (req, res) => {
  try {
    await paymentService.verifyPayment(req.user.id, req.body);
    res.json({ message: 'Payment verified & enrollment completed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* Payment failure */
router.post('/failure', authenticate, async (req, res) => {
  await paymentService.markPaymentFailed(req.body.paymentId);
  res.json({ message: 'Payment marked as failed' });
});

export default router;
