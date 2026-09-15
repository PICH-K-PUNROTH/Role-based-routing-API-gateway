const jwt = require("jsonwebtoken");

const verifyToken = (allowedRole) => (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired" });
      }
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (allowedRole && decoded.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied: a '${decoded.role}' token cannot access '${allowedRole}' APIs`,
      });
    }

    req.user = decoded;
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-email"] = decoded.email;
    req.headers["x-user-role"] = decoded.role;
    next();
  });
};

module.exports = verifyToken;