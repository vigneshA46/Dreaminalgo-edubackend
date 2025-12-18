import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 4️⃣ Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    next(); // ✅ allow request
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};
