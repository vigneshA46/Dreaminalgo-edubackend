import pool from '../../config/db.js';

/* CREATE COURSE */
export const createCourse = async (data, adminId) => {
  const {
    title,
    subline,
    author,
    aboutheading,
    description,
    language,
    duration,
    chapters,
    level,
    certificate,
    learning,
    bgimage_url,
    fee,
    status
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO courses (
      title,
      subline,
      author,
      aboutheading,
      description,
      language,
      duration,
      chapters,
      level,
      certificate,
      learning,
      bgimage_url,
      fee,
      status,
      createdby
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *
    `,
    [
      title,
      subline,
      author,
      aboutheading,
      description,
      language,
      duration,
      chapters,
      level,
      certificate,
      JSON.stringify(learning), // should be array → JSON
      bgimage_url,
      fee,
      status,
      adminId
    ]
  );

  return rows[0];
};


/* UPDATE COURSE – id in body */
export const updateCourse = async (data) => {
  const {
    id,
    title,
    subline,
    author,
    aboutheading,
    description,
    language,
    duration,
    chapters,
    level,
    certificate,
    learning,
    bgimage_url,
    fee,
    status
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE courses
    SET
      title = COALESCE($1, title),
      subline = COALESCE($2, subline),
      author = COALESCE($3, author),
      aboutheading = COALESCE($4, aboutheading),
      description = COALESCE($5, description),
      language = COALESCE($6, language),
      duration = COALESCE($7, duration),
      chapters = COALESCE($8, chapters),
      level = COALESCE($9, level),
      certificate = COALESCE($10, certificate),
      learning = COALESCE($11, learning),
      bgimage_url = COALESCE($12, bgimage_url),
      fee = COALESCE($13, fee),
      status = COALESCE($14, status),
      updatedat = NOW()
    WHERE id = $15
    RETURNING *
    `,
    [
      title,
      subline,
      author,
      aboutheading,
      description,
      language,
      duration,
      chapters,
      level,
      certificate,
      JSON.stringify(learning),
      bgimage_url,
      fee,
      status,
      id
    ]
  );

  return rows[0];
};


/* DELETE COURSE */
export const deleteCourse = async (id) => {
  await pool.query(
    'DELETE FROM courses WHERE id = $1',
    [id]
  );
};


/* GET SINGLE COURSE */
export const getCourseById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM courses
    WHERE id = $1
    `,
    [id]
  );

  return rows[0];
};

/* GET ALL COURSES */
export const getAllCourses = async () => {
  const { rows } = await pool.query(
    `
    SELECT
      *
    FROM courses
    ORDER BY createdat DESC
    `
  );

  return rows;
};


/* GET COURSES BY STATUS */
export const getCoursesByStatus = async (status) => {
  const statusLower = status.toLowerCase();

  const { rows } = await pool.query(
    `
    SELECT *
    FROM courses
    WHERE LOWER(status) = $1
    ORDER BY createdat DESC
    `,
    [statusLower]
  );

  return rows;
};

/* GET COURSES BY CATEGORY */
export const getCoursesByCategory = async (category) => {
  const categoryLower = category.toLowerCase();

  const { rows } = await pool.query(
    `
    SELECT *
    FROM courses
    WHERE LOWER(category) = $1
    ORDER BY createdat DESC
    `,
    [categoryLower]
  );

  return rows;
};

export const getCoursesByCategoryandStatus = async (category, status) => {
  const categoryLower = category.toLowerCase();
  const statusLower = status.toLowerCase();

  const { rows } = await pool.query(
    `
    SELECT *
    FROM courses
    WHERE LOWER(category) = $1
    AND LOWER(status) = $2
    ORDER BY createdat DESC
    `,
    [categoryLower, statusLower]
  );

  return rows;
};