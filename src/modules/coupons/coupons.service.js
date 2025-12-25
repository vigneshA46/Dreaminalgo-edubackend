import pool from '../../config/db.js';

/* 1. Create Coupon */
export const createCoupon = async (data, adminId) => {
  const {
    code,
    discountpercentage,
    type,
    validfrom,
    validto,
    usagelimit,
    status
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO coupons
     (code, discountpercentage, type, validfrom, validto, usagelimit, status, createdby)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [code, discountpercentage, type, validfrom, validto, usagelimit, status, adminId]
  );

  return rows[0];
};

/* 2. Update Coupon */
export const updateCoupon = async (id, data) => {
  const { rows } = await pool.query(
    `UPDATE coupons
     SET discountpercentage = COALESCE($1, discountpercentage),
         validfrom = COALESCE($2, validfrom),
         validto = COALESCE($3, validto),
         usagelimit = COALESCE($4, usagelimit),
         status = COALESCE($5, status)
     WHERE id = $6
     RETURNING *`,
    [
      data.discountpercentage,
      data.validfrom,
      data.validto,
      data.usagelimit,
      data.status,
      id
    ]
  );

  return rows[0];
};

/* 3. Disable Coupon */
export const disableCoupon = async (id) => {
  await pool.query(
    `UPDATE coupons SET status = 'inactive' WHERE id = $1`,
    [id]
  );
};

/* 4. Get All Coupons */
export const getAllCoupons = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM coupons ORDER BY createdat DESC`
  );
  return rows;
};

/* 5. Get Coupon Details */
export const getCouponById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM coupons WHERE id = $1`,
    [id]
  );
  return rows[0];
};

/* 6. Assign Coupon to Courses */
export const assignCourses = async (couponId, courseIds) => {
  for (const courseId of courseIds) {
    await pool.query(
      `INSERT INTO courponcourse (couponid, courseid)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [couponId, courseId]
    );
  }
};

/* 7. Remove Coupon from Course */
export const removeCourse = async (couponId, courseId) => {
  await pool.query(
    `DELETE FROM courponcourse WHERE couponid=$1 AND courseid=$2`,
    [couponId, courseId]
  );
};

/* 8. Validate Coupon */
export const validateCoupon = async (code, courseId, userId) => {
  const { rows } = await pool.query(
    `SELECT c.*
     FROM coupons c
     JOIN courponcourse cc ON cc.couponid = c.id
     WHERE c.code = $1
       AND cc.courseid = $2
       AND c.status = 'active'
       AND c.usedcount < c.usagelimit
       AND NOW() BETWEEN c.validfrom AND c.validto`,
    [code, courseId]
  );

  if (!rows.length) throw new Error('Invalid or expired coupon');

  const used = await pool.query(
    `SELECT 1 FROM couponredemptions
     WHERE couponid=$1 AND userid=$2`,
    [rows[0].id, userId]
  );

  if (used.rows.length) throw new Error('Coupon already used');

  return rows[0];
};

/* 9. Apply Coupon */
export const applyCoupon = async (code, courseId) => {
  const { rows } = await pool.query(
    `SELECT c.discountpercentage, cr.price
     FROM coupons c
     JOIN courponcourse cc ON cc.couponid = c.id
     JOIN courses cr ON cr.id = cc.courseid
     WHERE c.code=$1 AND cr.id=$2`,
    [code, courseId]
  );

  const discount = (rows[0].price * rows[0].discountpercentage) / 100;
  return {
    originalPrice: rows[0].price,
    discount,
    finalPrice: rows[0].price - discount
  };
};

/* 10. Redeem Coupon */
export const redeemCoupon = async (couponId, userId, paymentId) => {
  await pool.query(
    `INSERT INTO couponredemptions (couponid, userid, paymentid)
     VALUES ($1,$2,$3)`,
    [couponId, userId, paymentId]
  );

  await pool.query(
    `UPDATE coupons SET usedcount = usedcount + 1 WHERE id = $1`,
    [couponId]
  );
};

/* 11. Coupon Usage Report */
export const getCouponUsage = async (couponId) => {
  const { rows } = await pool.query(
    `SELECT u.email, cr.redeemedat, p.amount
     FROM couponredemptions cr
     JOIN users u ON u.id = cr.userid
     JOIN payments p ON p.id = cr.paymentid
     WHERE cr.couponid = $1`,
    [couponId]
  );

  return {
    totalRedemptions: rows.length,
    users: rows,
    revenueImpact: rows.reduce((sum, r) => sum + Number(r.amount), 0)
  };
};

/* 12. User Coupon History */
export const getUserCoupons = async (userId) => {
  const { rows } = await pool.query(
    `SELECT c.code, cr.redeemedat
     FROM couponredemptions cr
     JOIN coupons c ON c.id = cr.couponid
     WHERE cr.userid = $1`,
    [userId]
  );
  return rows;
};
