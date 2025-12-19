import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';
import crypto from 'crypto';

export const adminLoginService = async (email, password, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM admins WHERE email=$1 AND isactive=true',
    [email]
  );

  if (!rows.length) throw new Error('Invalid credentials');

  const admin = rows[0];

  const match = await bcrypt.compare(password, admin.passwordhash);
  if (!match) throw new Error('Invalid credentials');

  /* ACCESS TOKEN */
  const accessToken = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_ADMIN_ACCESS_SECRET,
    { expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRES }
  );

  /* REFRESH TOKEN */
  const refreshToken = jwt.sign(
    { id: admin.id },
    process.env.JWT_ADMIN_REFRESH_SECRET,
    { expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRES }
  );

  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await pool.query(
    `INSERT INTO adminrefreshtoken (adminid, tokenhash, expiresat)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [admin.id, tokenHash]
  );

  /* COOKIES */
  res.cookie('admin_access_token', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  res.cookie('admin_refresh_token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  };
};

export const adminLogoutService = async (refreshToken, res) => {
  if (!refreshToken) return;

  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await pool.query(
    'DELETE FROM adminrefreshtoken WHERE tokenhash=$1',
    [tokenHash]
  );

  res.clearCookie('admin_access_token');
  res.clearCookie('admin_refresh_token');
};
 