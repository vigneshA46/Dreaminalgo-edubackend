import pool from '../../config/db.js';

/* ================= UPDATE LESSON PROGRESS ================= */

export const updateLessonProgress = async (
  userId,
  lessonId,
  watchedSeconds,
  lessonDuration
) => {
  /* 1. Fetch existing progress */
  const existing = await pool.query(
    `SELECT watchedseconds, iscompleted
     FROM lessonprogress
     WHERE userid=$1 AND lessonid=$2`,
    [userId, lessonId]
  );

  let isCompleted = false;

  /* 2. Completion logic (90% rule) */
  if (lessonDuration && watchedSeconds >= lessonDuration * 0.9) {
    isCompleted = true;
  }

  if (!existing.rows.length) {
    /* 3. Insert new progress */
    await pool.query(
      `INSERT INTO lessonprogress
       (userid, lessonid, watchedseconds, iscompleted, lastwatchat)
       VALUES ($1,$2,$3,$4,NOW())`,
      [userId, lessonId, watchedSeconds, isCompleted]
    );
  } else {
    const previousSeconds = existing.rows[0].watchedseconds;

    /* 4. Prevent backward updates */
    if (watchedSeconds < previousSeconds) return;

    /* 5. Update progress */
    await pool.query(
      `UPDATE lessonprogress
       SET watchedseconds=$1,
           iscompleted = CASE
             WHEN iscompleted = true THEN true
             ELSE $2
           END,
           lastwatchat=NOW(),
           updatedat=NOW()
       WHERE userid=$3 AND lessonid=$4`,
      [watchedSeconds, isCompleted, userId, lessonId]
    );
  }
};

/* ================= GET LESSON PROGRESS ================= */

export const getLessonProgress = async (userId, lessonId) => {
  const res = await pool.query(
    `SELECT watchedseconds, iscompleted
     FROM lessonprogress
     WHERE userid=$1 AND lessonid=$2`,
    [userId, lessonId]
  );

  return res.rows[0] || { watchedseconds: 0, iscompleted: false };
};

/* ================= COURSE PROGRESS ================= */

export const getCourseProgress = async (userId, courseId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(l.id) AS total,
      COUNT(lp.id) FILTER (WHERE lp.iscompleted=true) AS completed
    FROM lessons l
    JOIN chapter c ON l.chapterid = c.id
    LEFT JOIN lessonprogress lp
      ON lp.lessonid = l.id AND lp.userid = $1
    WHERE c.courseid = $2
    `,
    [userId, courseId]
  );

  const { total, completed } = result.rows[0];

  return {
    totalLessons: Number(total),
    completedLessons: Number(completed),
    progressPercentage:
      total === '0' ? 0 : Math.round((completed / total) * 100)
  };
};
