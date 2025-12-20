import pool from '../../config/db.js';

/* CREATE LESSON */
export const createLesson = async (data) => {
  const {
    chapterid,
    title,
    mediaurl,
    duration,
    idpreview,
    orderindex
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO lessons (
      chapterid,
      title,
      mediaurl,
      duration,
      idpreview,
      orderindex
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [chapterid, title, mediaurl, duration, idpreview, orderindex]
  );

  return rows[0];
};

/* UPDATE LESSON */
export const updateLesson = async (data) => {
  const {
    id,
    title,
    mediaurl,
    duration,
    idpreview,
    orderindex
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE lessons
    SET
      title = COALESCE($1, title),
      mediaurl = COALESCE($2, mediaurl),
      duration = COALESCE($3, duration),
      idpreview = COALESCE($4, idpreview),
      orderindex = COALESCE($5, orderindex)
    WHERE id = $6
    RETURNING *
    `,
    [title, mediaurl, duration, idpreview, orderindex, id]
  );

  return rows[0];
};

/* DELETE LESSON */
export const deleteLesson = async (id) => {
  await pool.query(
    'DELETE FROM lessons WHERE id = $1',
    [id]
  );
};

/* GET LESSONS BY CHAPTER (ADMIN) */
export const getLessonsByChapter = async (chapterid) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      title,
      duration,
      idpreview,
      orderindex,
      createdat
    FROM lessons
    WHERE chapterid = $1
    ORDER BY orderindex ASC
    `,
    [chapterid]
  );

  return rows;
};

/* REORDER LESSONS */
export const reorderLessons = async (chapterid, lessons) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const lesson of lessons) {
      await client.query(
        `
        UPDATE lessons
        SET orderindex = $1
        WHERE id = $2 AND chapterid = $3
        `,
        [lesson.orderindex, lesson.id, chapterid]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* =========================
   USER LOGIC
========================= */

/* GET LESSONS BY CHAPTER (USER)
   - published course only
   - preview lessons visible
*/
export const getUserLessonsByChapter = async (chapterid, userid) => {
  const { rows } = await pool.query(
    `
    SELECT
      l.id,
      l.title,
      l.duration,
      l.idpreview,
      l.orderindex
    FROM lessons l
    JOIN chapter c ON c.id = l.chapterid
    JOIN courses co ON co.id = c.courseid
    WHERE l.chapterid = $1
      AND co.status = 'published'
    ORDER BY l.orderindex ASC
    `,
    [chapterid]
  );

  return rows;
};

/* GET SINGLE LESSON (USER)
   RULE:
   - preview lesson → allowed
   - non-preview → user must be enrolled
*/
export const getSingleLessonForUser = async (lessonid, userid) => {
  const { rows } = await pool.query(
    `
    SELECT
      l.id,
      l.title,
      l.mediaurl,
      l.duration,
      l.idpreview,
      co.id AS courseid,
      e.id AS enrollmentid
    FROM lessons l
    JOIN chapter c ON c.id = l.chapterid
    JOIN courses co ON co.id = c.courseid
    LEFT JOIN enrollments e
      ON e.courseid = co.id AND e.userid = $2
    WHERE l.id = $1
      AND co.status = 'published'
    `,
    [lessonid, userid]
  );

  const lesson = rows[0];

  if (!lesson) return null;

  /* Preview allowed */
  if (lesson.idpreview) {
    return lesson;
  }

  /* Non-preview → must be enrolled */
  if (!lesson.enrollmentid) {
    throw new Error('Access denied: enrollment required');
  }

  return lesson;
};
