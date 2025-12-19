import { Router } from 'express';
import {
  adminLogin,
  adminLogout
} from './admin.auth.controller.js';
import  refreshAdminToken  from './admin.refresh.controller.js';

const router = Router();

router.post('/login', adminLogin);
router.post('/refresh', refreshAdminToken);
router.post('/logout', adminLogout);

export default router;
