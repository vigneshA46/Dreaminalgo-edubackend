import pool from '../../config/db.js';

/* ADMIN: Create announcement */
export const createAnnouncement = async (data) => {
  const {
    title,
    titlecolor,
    message,
    messagecolor,
    courseid,
    gradientstart,
    gradientend,
    icon,
    iconcolor,
    iconbg,
    expiresat
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO announcements
    (
      title, titlecolor, message, messagecolor,
      courseid, gradientstart, gradientend,
      icon, iconcolor, iconbg, expiresat
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
    `,
    [
      title,
      titlecolor,
      message,
      messagecolor,
      courseid || null,
      gradientstart,
      gradientend,
      icon,
      iconcolor,
      iconbg,
      expiresat || null
    ]
  );

  return rows[0];
};

/* ADMIN: Update announcement */
export const updateAnnouncement = async (data) => {
  const {
    id,
    title,
    titlecolor,
    message,
    messagecolor,
    courseid,
    gradientstart,
    gradientend,
    icon,
    iconcolor,
    iconbg,
    expiresat,
    isactive
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE announcements
    SET
      title = COALESCE($1, title),
      titlecolor = COALESCE($2, titlecolor),
      message = COALESCE($3, message),
      messagecolor = COALESCE($4, messagecolor),
      courseid = COALESCE($5, courseid),
      gradientstart = COALESCE($6, gradientstart),
      gradientend = COALESCE($7, gradientend),
      icon = COALESCE($8, icon),
      iconcolor = COALESCE($9, iconcolor),
      iconbg = COALESCE($10, iconbg),
      expiresat = COALESCE($11, expiresat),
      isactive = COALESCE($12, isactive)
    WHERE id = $13
    RETURNING *
    `,
    [
      title,
      titlecolor,
      message,
      messagecolor,
      courseid,
      gradientstart,
      gradientend,
      icon,
      iconcolor,
      iconbg,
      expiresat,
      isactive,
      id
    ]
  );

  return rows[0];
};

/* ADMIN: Deactivate announcement */
export const deactivateAnnouncement = async (id) => {
  await pool.query(
    `
    UPDATE announcements
    SET isactive = false
    WHERE id = $1
    `,
    [id]
  );
};

/* ADMIN: Get all announcements */
export const getAllAnnouncementsAdmin = async () => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM announcements
    ORDER BY createdat DESC
    `
  );
  return rows;
};

/* ADMIN: Get single announcement */
export const getAnnouncementById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM announcements
    WHERE id = $1
    `,
    [id]
  );
  return rows[0];
};

/* USER: Get active announcements (global + course) */
export const getActiveAnnouncements = async (courseid = null) => {
  const query = `
    SELECT *
    FROM announcements
    WHERE isactive = true
      AND (expiresat IS NULL OR expiresat > NOW())
      AND (
        courseid IS NULL
        OR ($1::uuid IS NOT NULL AND courseid = $1)
      )
    ORDER BY createdat DESC
  `;

  const { rows } = await pool.query(query, [courseid]);
  return rows;
};


/* USER: Get course-only announcements */
export const getCourseAnnouncements = async (courseid) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM announcements
    WHERE isactive = true
      AND courseid = $1
      AND (expiresat IS NULL OR expiresat > NOW())
    ORDER BY createdat DESC
    `,
    [courseid]
  );

  return rows;
};
