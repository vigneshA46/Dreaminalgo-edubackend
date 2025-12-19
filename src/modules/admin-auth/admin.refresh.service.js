import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../config/db.js';

const refreshAdminTokenService = async (refreshToken, res) => {
  if (!refreshToken) throw new Error('Invalid refresh token');

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_ADMIN_REFRESH_SECRET
  );

  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const { rowCount } = await pool.query(
    'SELECT 1 FROM adminrefreshtoken WHERE tokenhash=$1',
    [tokenHash]
  );

  if (!rowCount) throw new Error('Invalid refresh token');

  /* ROTATE TOKEN */
  await pool.query(
    'DELETE FROM adminrefreshtoken WHERE tokenhash=$1',
    [tokenHash]
  );

  const newAccessToken = jwt.sign(
    { id: decoded.id, role: 'admin' },
    process.env.JWT_ADMIN_ACCESS_SECRET,
    { expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRES }
  );

  const newRefreshToken = jwt.sign(
    { id: decoded.id },
    process.env.JWT_ADMIN_REFRESH_SECRET,
    { expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRES }
  );

  const newHash = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');

  await pool.query(
    `INSERT INTO adminrefreshtoken (adminid, tokenhash, expiresat)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [decoded.id, newHash]
  );

  res.cookie('admin_access_token', newAccessToken, {
    httpOnly: true,
    sameSite: 'lax',
  });

  res.cookie('admin_refresh_token', newRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
  });

  return {
    admin: { id: decoded.id, role: 'admin' },
  };
};

export default refreshAdminTokenService;
