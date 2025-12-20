import pool from '../../config/db.js';

/* CREATE CHAPTER */
export const createChapter = async (data) => {
  const { courseid, title, icon, orderindex } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO chapter (
      courseid,
      title,
      icon,
      orderindex
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [courseid, title, icon, orderindex]
  );

  return rows[0];
};

/* UPDATE CHAPTER */
export const updateChapter = async (data) => {
  const { id, title, icon, orderindex } = data;

  const { rows } = await pool.query(
    `
    UPDATE chapter
    SET
      title = COALESCE($1, title),
      icon = COALESCE($2, icon),
      orderindex = COALESCE($3, orderindex)
    WHERE id = $4
    RETURNING *
    `,
    [title, icon, orderindex, id]
  );

  return rows[0];
};

/* DELETE CHAPTER */
export const deleteChapter = async (id) => {
  await pool.query(
    'DELETE FROM chapter WHERE id = $1',
    [id]
  );
};

/* GET CHAPTERS BY COURSE (ADMIN) */
export const getChaptersByCourse = async (courseid) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      title,
      icon,
      orderindex,
      createdat
    FROM chapter
    WHERE courseid = $1
    ORDER BY orderindex ASC
    `,
    [courseid]
  );

  return rows;
};

/* REORDER CHAPTERS */
export const reorderChapters = async (courseid, chapters) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const chapter of chapters) {
      await client.query(
        `
        UPDATE chapter
        SET orderindex = $1
        WHERE id = $2 AND courseid = $3
        `,
        [chapter.orderindex, chapter.id, courseid]
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

/* GET CHAPTERS FOR USER */
export const getUserChapters = async (courseid) => {
  const { rows } = await pool.query(
    `
    SELECT
      c.id,
      c.title,
      c.icon,
      c.orderindex
    FROM chapter c
    JOIN courses co ON co.id = c.courseid
    WHERE c.courseid = $1
      AND co.status = 'published'
    ORDER BY c.orderindex ASC
    `,
    [courseid]
  );

  return rows;
};
