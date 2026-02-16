import pkg from "pg";
const { Pool } = pkg;
import bcrypt from 'bcrypt'

// ==========================
// DB Connection
// ==========================
const pool = new Pool({
  connectionString: `postgresql://postgres:qFlwubAmjNuyGVANTVgoTCQCpOjoPwqY@hopper.proxy.rlwy.net:50108/railway`,
  ssl: {
    rejectUnauthorized: false
  }
});

// ==========================
// Seed Admin Function
// ==========================
async function seedAdmin() {
  try {
    const admincode = "ROOT001";
    const name = "Super Admin";
    const email = "admmin@gmail.com";
    const password = "123456";
    const role = "superadmin";

    //  Hash Password
    const saltRounds = 12;
    const passwordhash = await bcrypt.hash(password, saltRounds);

    //  Insert Query
    const query = `
      INSERT INTO admins 
      (admincode, name, email, passwordhash, role, isactive)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, admincode, email, role, createdat;
    `;

    const values = [
      admincode,
      name,
      email,
      passwordhash,
      role,
      true
    ];

    const result = await pool.query(query, values);

    console.log("✅ Admin inserted successfully:");
    console.log(result.rows[0]);

  } catch (error) {
    if (error.code === "23505") {
      console.log("⚠️ Admin already exists (duplicate email/admincode).");
    } else {
      console.error("❌ Error inserting admin:");
      console.error(error);
    }
  } finally {
    await pool.end();
  }
}

seedAdmin();
