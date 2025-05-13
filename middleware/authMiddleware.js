const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

exports.protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const query =
        "SELECT user_id, username, email, is_admin FROM users WHERE user_id = ?";
      db.get(query, [decoded.id], (err, user) => {
        if (err) {
          console.error("Auth middleware DB error:", err.message);
          return res
            .status(500)
            .json({ error: "Server error during authentication." });
        }
        if (!user) {
          return res
            .status(401)
            .json({ error: "Not authorized, user not found" });
        }
        req.user = { ...user, is_admin: !!user.is_admin }; // Ensure is_admin is boolean
        next();
      });
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }
  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

exports.authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ error: "Not authorized as an admin" });
  }
};
