import pool from '../../config/db.js';

/* USER: Enroll in course */
export const enrollCourse = async (userid, courseid) => {
  // Check course is published
  const course = await pool.query(
    'SELECT status, isfree FROM courses WHERE id = $1',
    [courseid]
  );

  if (!course.rows.length || course.rows[0].status !== 'published') {
    throw new Error('Course not available for enrollment');
  }

  // Insert enrollment
  const { rows } = await pool.query(
    `
    INSERT INTO enrollments (userid, courseid, status)
    VALUES ($1, $2, 'active')
    ON CONFLICT (userid, courseid) DO NOTHING
    RETURNING *
    `,
    [userid, courseid]
  );

  if (!rows.length) {
    throw new Error('Already enrolled in this course');
  }

  return rows[0];
};

/* USER: Check enrollment */
export const checkEnrollment = async (userid, courseid) => {
  const { rows } = await pool.query(
    `
    SELECT status
    FROM enrollments
    WHERE userid = $1 AND courseid = $2
    `,
    [userid, courseid]
  );

  if (!rows.length) {
    return { enrolled: false };
  }

  return {
    enrolled: true,
    status: rows[0].status
  };
};

/* USER: Get my enrolled courses */
export const getMyEnrollments = async (userid) => {
  const { rows } = await pool.query(
    `
    SELECT
      e.id AS enrollmentid,
      e.status,
      e.enrolledat,
      c.id AS courseid,
      c.title,
      c.shortdescription,
      c.tutor,
      c.price,
      c.isfree
    FROM enrollments e
    JOIN courses c ON c.id = e.courseid
    WHERE e.userid = $1
    ORDER BY e.enrolledat DESC
    `,
    [userid]
  );

  return rows;
};

/* ADMIN: Get enrollments by course */
export const getEnrollmentsByCourse = async (courseid) => {
  const { rows } = await pool.query(
    `
    SELECT
      e.id,
      e.status,
      e.enrolledat,
      u.id AS userid,
      u.email,
      u.fullname
    FROM enrollments e
    JOIN users u ON u.id = e.userid
    WHERE e.courseid = $1
    ORDER BY e.enrolledat DESC
    `,
    [courseid]
  );

  return rows;
};

/* ADMIN: Manually enroll user */
export const adminEnrollUser = async (userid, courseid) => {
  const { rows } = await pool.query(
    `
    INSERT INTO enrollments (userid, courseid, status)
    VALUES ($1, $2, 'active')
    ON CONFLICT (userid, courseid) DO NOTHING
    RETURNING *
    `,
    [userid, courseid]
  );

  if (!rows.length) {
    throw new Error('User already enrolled');
  }

  return rows[0];
};

/* ADMIN: Revoke enrollment */
export const revokeEnrollment = async (userid, courseid) => {
  await pool.query(
    `
    UPDATE enrollments
    SET status = 'cancelled'
    WHERE userid = $1 AND courseid = $2
    `,
    [userid, courseid]
  );
};
