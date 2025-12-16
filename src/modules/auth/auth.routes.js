import { Router } from "express";
import { signup, login, verifyEmail } from "./auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

export default router;