import {
  adminLoginService,
  adminLogoutService
} from './admin.auth.service.js';

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const result = await adminLoginService(email, password, res);

  return res.status(200).json({
    message: 'Admin logged in successfully',
    admin: result.admin,
  });
};

export const adminLogout = async (req, res) => {
  const refreshToken = req.cookies.admin_refresh_token;

  await adminLogoutService(refreshToken, res);

  return res.status(200).json({ message: 'Admin logged out' });
};
