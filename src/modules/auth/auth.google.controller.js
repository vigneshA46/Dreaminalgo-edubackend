import { googleLoginService } from "./auth.google.service.js";

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Google token required" });
  }

  const { accessToken, refreshToken } =
    await googleLoginService(idToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
  });

  res.status(200).json({ accessToken });
};
