import pool from "../../config/db.js";
import { verifyGoogleIdToken } from "../../utils/google.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";

export const googleLoginService = async (idToken) => {
  const googleUser = await verifyGoogleIdToken(idToken);

  if (!googleUser.emailVerified) {
    throw new Error("Google email not verified");
  }

  const { email, fullname, googleId } = googleUser;

  // 1️⃣ Check if user exists (by google_id or email)
  const userRes = await pool.query(
    `
    SELECT * FROM users
    WHERE google_id = $1 OR email = $2
    `,
    [googleId, email]
  );

  let user;

  if (userRes.rows.length) {
    user = userRes.rows[0];

    // If user exists but signed up locally before
    if (user.auth_provider === "local" && !user.google_id) {
      await pool.query(
        `
        UPDATE users
        SET google_id = $1, auth_provider = 'google'
        WHERE id = $2
        `,
        [googleId, user.id]
      );
    }
  } else {
    // 2️⃣ Create new Google user
    const newUserRes = await pool.query(
      `
      INSERT INTO users (email, fullname, auth_provider, google_id, isactive)
      VALUES ($1, $2, 'google', $3, true)
      RETURNING *
      `,
      [email, fullname, googleId]
    );

    user = newUserRes.rows[0];
  }

  // 3️⃣ Issue tokens
  const accessToken = signAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user.id,
  });

  // 4️⃣ Store refresh token
  await pool.query(
    `
    INSERT INTO refreshtoken (userid, tokenhash, expiresat)
    VALUES ($1, $2, NOW() + INTERVAL '7 days')
    `,
    [user.id, refreshToken]
  );

  return { accessToken, refreshToken };
};
