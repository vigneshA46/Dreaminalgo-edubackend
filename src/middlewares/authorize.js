const authorize = (...allowedRoles) => {

  return (req, res, next) => {

    if (!req.auth) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
 

export default authorize;