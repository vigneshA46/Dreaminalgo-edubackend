import jwt from 'jsonwebtoken';

const authenticate =(req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token missing' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    console.log("user" , req.user)
    // attach user/admin info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      type: decoded.type // 'user' or 'admin'
    };
    next();
  } catch (error) {
    console.log(req.role)
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
 
export default authenticate;
 