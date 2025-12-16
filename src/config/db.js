import pkg from "pg";
const { Pool } = pkg;


const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), 
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export const initDB = async () => {
  try {
    // Enable UUID extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    /* USERS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordhash TEXT NOT NULL,
        fullname VARCHAR(255),
        role VARCHAR(50),
        isactive BOOLEAN DEFAULT true,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* REFRESH TOKEN */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refreshtoken (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        userid UUID REFERENCES users(id) ON DELETE CASCADE,
        tokenhash TEXT NOT NULL,
        expiresat TIMESTAMP NOT NULL,
        revokedat TIMESTAMP,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ADMINS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admincode VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordhash TEXT NOT NULL,
        role VARCHAR(50),
        isactive BOOLEAN DEFAULT true,
        lastlogin TIMESTAMP,
        createdby UUID REFERENCES admins(id),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ADMIN REFRESH TOKEN */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS adminrefreshtoken (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        adminid UUID REFERENCES admins(id) ON DELETE CASCADE,
        tokenhash TEXT NOT NULL,
        expiresat TIMESTAMP NOT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* COURSES */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255),
        shortdescription TEXT,
        description TEXT,
        fulldetails TEXT,
        tutor VARCHAR(255),
        category VARCHAR(100),
        price NUMERIC(10,2),
        isfree BOOLEAN DEFAULT false,
        status VARCHAR(50),
        tumbnai TEXT,
        backgroundimage TEXT,
        createdby UUID REFERENCES admins(id),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* CHAPTER */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chapter (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        courseid UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255),
        icon VARCHAR(100),
        orderindex INT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* LESSONS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        chapterid UUID REFERENCES chapter(id) ON DELETE CASCADE,
        title VARCHAR(255),
        mediaurl TEXT,
        duration INT,
        idpreview BOOLEAN DEFAULT false,
        orderindex INT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ENROLLMENTS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        userid UUID REFERENCES users(id) ON DELETE CASCADE,
        courseid UUID REFERENCES courses(id) ON DELETE CASCADE,
        status VARCHAR(50),
        enrolledat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* LESSON PROGRESS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessonprogress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        userid UUID REFERENCES users(id) ON DELETE CASCADE,
        lessonid UUID REFERENCES lessons(id) ON DELETE CASCADE,
        iscompleted BOOLEAN DEFAULT false,
        watchedseconds INT DEFAULT 0,
        lastwatchat TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* PAYMENTS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        userid UUID REFERENCES users(id),
        courseid UUID REFERENCES courses(id),
        amount NUMERIC(10,2),
        currency VARCHAR(10),
        status VARCHAR(50),
        provider VARCHAR(50),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* COUPONS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        discountpercentage INT,
        type VARCHAR(50),
        validfron TIMESTAMP,
        validto TIMESTAMP,
        usagelimit INT,
        usedcount INT DEFAULT 0,
        status VARCHAR(50),
        createdby UUID REFERENCES admins(id),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* COUPON COURSE */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courponcourse (
        couponid UUID REFERENCES coupons(id) ON DELETE CASCADE,
        courseid UUID REFERENCES courses(id) ON DELETE CASCADE,
        PRIMARY KEY (couponid, courseid)
      );
    `);

    /* COUPON REDEMPTIONS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS couponredemptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        couponsid UUID REFERENCES coupons(id),
        userid UUID REFERENCES users(id),
        paymentid UUID REFERENCES payments(id),
        redeemedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ANNOUNCEMENTS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255),
        titlecolor VARCHAR(50),
        message TEXT,
        messagecolor VARCHAR(50),
        courseid UUID REFERENCES courses(id),
        gradientstart VARCHAR(50),
        gradientend VARCHAR(50),
        isactive BOOLEAN DEFAULT true,
        icon VARCHAR(100),
        iconcolor VARCHAR(50),
        iconbg VARCHAR(50),
        expiresat TIMESTAMP,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ACTIVE LOGS */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activelogs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        adminid UUID REFERENCES admins(id),
        action TEXT,
        entutytype VARCHAR(100),
        entityid UUID,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

    console.log("✅ Database connected & tables verified");
  } catch (error) {
    console.error("❌ Database initialization failed", error);
    process.exit(1);
  }
};

export default pool;
