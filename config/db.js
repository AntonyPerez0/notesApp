const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const DBSOURCE = process.env.DATABASE_FILE_PATH || "dev.sqlite3";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.serialize(() => {
      db.run("PRAGMA foreign_keys = ON;", (pragmaErr) => {
        if (pragmaErr)
          console.error("Error enabling foreign keys:", pragmaErr.message);
      });

      db.run(`CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                updated_at TEXT DEFAULT (datetime('now','localtime'))
            )`);

      db.run(`CREATE TABLE IF NOT EXISTS notes (
                note_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                updated_at TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )`);

      db.run(`CREATE TRIGGER IF NOT EXISTS update_users_updated_at
              AFTER UPDATE ON users FOR EACH ROW BEGIN
                  UPDATE users SET updated_at = (datetime('now','localtime')) WHERE user_id = OLD.user_id;
              END;`);

      db.run(`CREATE TRIGGER IF NOT EXISTS update_notes_updated_at
              AFTER UPDATE ON notes FOR EACH ROW BEGIN
                  UPDATE notes SET updated_at = (datetime('now','localtime')) WHERE note_id = OLD.note_id;
              END;`);
    });
  }
});

module.exports = db;
