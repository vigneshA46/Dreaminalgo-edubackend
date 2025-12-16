import * as authService from "./auth.service.js";

export const signup = async (req, res) => {
  const result = await authService.signupService(req.body);
  res.status(201).json(result);
};

export const login = async (req, res) => {
  const { accessToken, refreshToken } =
    await authService.loginService(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ accessToken });
};

export const verifyEmail = async (req, res) => {
  await authService.verifyEmailService(req.query.token);
  res.json({ message: "Email verified successfully" });
};
