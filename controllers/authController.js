const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin: !!isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res
      .status(400)
      .json({ error: "Please provide username, email, and password" });

  db.get(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [email, username],
    async (err, row) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Server error during registration check" });
      if (row)
        return res
          .status(400)
          .json({ error: "User already exists with this email or username" });

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      db.run(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, password_hash],
        function (insertErr) {
          if (insertErr) {
            if (insertErr.message.includes("UNIQUE constraint failed"))
              return res
                .status(400)
                .json({ error: "Username or email already taken." });
            return res
              .status(500)
              .json({ error: "Server error during registration" });
          }
          db.get(
            "SELECT user_id, username, email, is_admin, created_at FROM users WHERE user_id = ?",
            [this.lastID],
            (getErr, newUser) => {
              if (getErr || !newUser)
                return res
                  .status(500)
                  .json({ error: "Server error fetching new user" });
              res.status(201).json({
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: !!newUser.is_admin,
                createdAt: newUser.created_at,
                token: generateToken(newUser.user_id, newUser.is_admin),
              });
            }
          );
        }
      );
    }
  );
};

exports.loginUser = (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password)
    return res
      .status(400)
      .json({ error: "Please provide email/username and password" });

  db.get(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [emailOrUsername, emailOrUsername],
    async (err, user) => {
      if (err)
        return res.status(500).json({ error: "Server error during login" });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (isMatch) {
        res.json({
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          isAdmin: !!user.is_admin,
          token: generateToken(user.user_id, user.is_admin),
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  );
};

exports.getMe = (req, res) => res.status(200).json(req.user);

exports.getAllUsers = (req, res) => {
  db.all(
    "SELECT user_id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch users" });
      res
        .status(200)
        .json(rows.map((user) => ({ ...user, is_admin: !!user.is_admin })));
    }
  );
};

exports.adminUpdateUser = (req, res) => {
  const { userId } = req.params;
  const { username, email, is_admin } = req.body;
  if (!username && !email && typeof is_admin === "undefined")
    return res.status(400).json({ error: "Nothing to update" });

  let fields = [],
    params = [];
  if (username) {
    fields.push("username = ?");
    params.push(username);
  }
  if (email) {
    fields.push("email = ?");
    params.push(email);
  }
  if (typeof is_admin === "boolean" || typeof is_admin === "number") {
    fields.push("is_admin = ?");
    params.push(is_admin ? 1 : 0);
  }
  if (fields.length === 0)
    return res.status(400).json({ error: "No valid fields for update." });
  params.push(userId);

  db.run(
    `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
    params,
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed"))
          return res
            .status(400)
            .json({ error: "Username or email already in use." });
        return res.status(500).json({ error: "Failed to update user" });
      }
      if (this.changes === 0)
        return res
          .status(404)
          .json({ error: "User not found or no changes made" });
      db.get(
        "SELECT user_id, username, email, is_admin FROM users WHERE user_id = ?",
        [userId],
        (getErr, updatedUser) => {
          if (getErr || !updatedUser)
            return res
              .status(500)
              .json({ error: "Failed to fetch updated user." });
          res
            .status(200)
            .json({ ...updatedUser, is_admin: !!updatedUser.is_admin });
        }
      );
    }
  );
};

exports.adminDeleteUser = (req, res) => {
  const { userId } = req.params;
  if (req.user.user_id === parseInt(userId))
    return res
      .status(400)
      .json({ error: "Admin cannot delete their own account." });

  db.run("DELETE FROM users WHERE user_id = ?", [userId], function (err) {
    if (err) return res.status(500).json({ error: "Failed to delete user" });
    if (this.changes === 0)
      return res.status(404).json({ error: "User not found" });
    res
      .status(200)
      .json({ message: `User (ID: ${userId}) deleted successfully` });
  });
};
