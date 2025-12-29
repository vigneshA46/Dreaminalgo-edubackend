import pool from '../../config/db.js';

/* CREATE COURSE */
export const createCourse = async (data, adminId) => {
  const {
    title,
    shortdescription,
    description,
    fulldetails,
    tutor,
    category,
    price,
    isfree,
    status,
    tumbnai,
    backgroundimage
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO courses (
      title,
      shortdescription,
      description,
      fulldetails,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      backgroundimage,
      createdby
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      title,
      shortdescription,
      description,
      fulldetails,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      backgroundimage,
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
    shortdescription,
    description,
    fulldetails,
    tutor,
    category,
    price,
    isfree,
    status,
    tumbnai,
    backgroundimage
  } = data;

  const { rows } = await pool.query(
    `
    UPDATE courses
    SET
      title = COALESCE($1, title),
      shortdescription = COALESCE($2, shortdescription),
      description = COALESCE($3, description),
      fulldetails = COALESCE($4, fulldetails),
      tutor = COALESCE($5, tutor),
      category = COALESCE($6, category),
      price = COALESCE($7, price),
      isfree = COALESCE($8, isfree),
      status = COALESCE($9, status),
      tumbnai = COALESCE($10, tumbnai),
      backgroundimage = COALESCE($11, backgroundimage),
      updatedat = NOW()
    WHERE id = $12
    RETURNING *
    `,
    [
      title,
      shortdescription,
      description,
      fulldetails,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      backgroundimage,
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
    SELECT
      id,
      title,
      shortdescription,
      description,
      fulldetails,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      backgroundimage,
      createdat,
      updatedat
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
      id,
      title,
      category,
      tutor,
      price,
      isfree,
      status,
      createdat
    FROM courses
    ORDER BY createdat DESC
    `
  );

  return rows;
};

/* GET COURSES BY STATUS */
export const getCoursesByStatus = async (status) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      title,
      shortdescription,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      createdat
    FROM courses
    WHERE status = $1
    ORDER BY createdat DESC
    `,
    [status]
  );

  return rows;
};


/* GET COURSES BY CATEGORY */
export const getCoursesByCategory = async (category) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      title,
      shortdescription,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      createdat
    FROM courses
    WHERE category = $1
    ORDER BY createdat DESC
    `,
    [category]
  );

  return rows;
};


export const getCoursesByCategoryandStatus = async (category , status) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      title,
      shortdescription,
      tutor,
      category,
      price,
      isfree,
      status,
      tumbnai,
      createdat
    FROM courses
    WHERE category = $1
    AND status = $2
    ORDER BY createdat DESC
    `,
    [category,status]
  );

  return rows;
};
