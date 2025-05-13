const db = require("../config/db");

exports.createNote = (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.user_id;
  if (!title) return res.status(400).json({ error: "Title is required" });

  db.run(
    "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
    [userId, title, content],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to create note" });
      db.get(
        "SELECT * FROM notes WHERE note_id = ?",
        [this.lastID],
        (getErr, newNote) => {
          if (getErr || !newNote)
            return res
              .status(500)
              .json({ error: "Failed to retrieve created note" });
          res.status(201).json(newNote);
        }
      );
    }
  );
};

exports.getAllUserNotes = (req, res) => {
  const userId = req.user.user_id;
  const isAdmin = req.user.is_admin;
  let query,
    params = [];

  if (isAdmin) {
    query = `SELECT n.*, u.username as author_username FROM notes n JOIN users u ON n.user_id = u.user_id ORDER BY n.created_at DESC`;
  } else {
    query = "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC";
    params = [userId];
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch notes" });
    res.status(200).json(rows);
  });
};

exports.getNoteById = (req, res) => {
  const { noteId } = req.params;
  const requestingUserId = req.user.user_id;
  const isAdmin = req.user.is_admin;

  const query = `SELECT n.*, u.user_id AS author_user_id, u.username AS author_username
                 FROM notes n JOIN users u ON n.user_id = u.user_id WHERE n.note_id = ?`;
  db.get(query, [noteId], (err, note) => {
    if (err) return res.status(500).json({ error: "Failed to fetch note" });
    if (!note) return res.status(404).json({ error: "Note not found." });
    if (!isAdmin && note.author_user_id !== requestingUserId)
      return res.status(403).json({ error: "Access denied." });
    res.status(200).json({
      note_id: note.note_id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
      user: { user_id: note.author_user_id, username: note.author_username },
    });
  });
};

exports.updateNote = (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;
  const userId = req.user.user_id;
  if (!title && !content)
    return res
      .status(400)
      .json({ error: "Title or content required for update" });

  db.get(
    "SELECT user_id FROM notes WHERE note_id = ?",
    [noteId],
    (findErr, note) => {
      if (findErr)
        return res.status(500).json({ error: "Server error finding note" });
      if (!note) return res.status(404).json({ error: "Note not found" });
      if (note.user_id !== userId)
        return res
          .status(403)
          .json({ error: "Access denied to update this note" });

      let fields = [],
        params = [];
      if (title) {
        fields.push("title = ?");
        params.push(title);
      }
      if (content) {
        fields.push("content = ?");
        params.push(content);
      }
      if (fields.length === 0)
        return res.status(400).json({ error: "No fields to update" });
      params.push(noteId);

      db.run(
        `UPDATE notes SET ${fields.join(", ")} WHERE note_id = ?`,
        params,
        function (updateErr) {
          if (updateErr)
            return res.status(500).json({ error: "Failed to update note" });
          if (this.changes === 0)
            return res
              .status(404)
              .json({ error: "Note not found or no changes made" });
          db.get(
            "SELECT * FROM notes WHERE note_id = ?",
            [noteId],
            (getErr, updatedNote) => {
              if (getErr || !updatedNote)
                return res
                  .status(500)
                  .json({ error: "Failed to retrieve updated note" });
              res.status(200).json(updatedNote);
            }
          );
        }
      );
    }
  );
};

exports.deleteNote = (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.user_id;

  db.get(
    "SELECT user_id FROM notes WHERE note_id = ?",
    [noteId],
    (findErr, note) => {
      if (findErr)
        return res.status(500).json({ error: "Server error finding note" });
      if (!note) return res.status(404).json({ error: "Note not found" });
      if (note.user_id !== userId)
        return res
          .status(403)
          .json({ error: "Access denied to delete this note" });

      db.run("DELETE FROM notes WHERE note_id = ?", [noteId], function (err) {
        if (err)
          return res.status(500).json({ error: "Failed to delete note" });
        if (this.changes === 0)
          return res
            .status(404)
            .json({ error: "Note not found (already deleted or wrong ID)" });
        res.status(200).json({ message: "Note deleted successfully" });
      });
    }
  );
};

exports.adminUpdateNote = (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;
  if (!title && !content)
    return res.status(400).json({ error: "Title or content required" });

  let fields = [],
    params = [];
  if (title) {
    fields.push("title = ?");
    params.push(title);
  }
  if (content) {
    fields.push("content = ?");
    params.push(content);
  }
  if (fields.length === 0)
    return res.status(400).json({ error: "No fields to update" });
  params.push(noteId);

  db.run(
    `UPDATE notes SET ${fields.join(", ")} WHERE note_id = ?`,
    params,
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to update note by admin" });
      if (this.changes === 0)
        return res
          .status(404)
          .json({ error: "Note not found or no changes made" });
      db.get(
        "SELECT * FROM notes WHERE note_id = ?",
        [noteId],
        (getErr, updatedNote) => {
          if (getErr || !updatedNote)
            return res
              .status(500)
              .json({ error: "Failed to retrieve admin updated note" });
          res.status(200).json(updatedNote);
        }
      );
    }
  );
};

exports.adminDeleteNote = (req, res) => {
  const { noteId } = req.params;
  db.run("DELETE FROM notes WHERE note_id = ?", [noteId], function (err) {
    if (err)
      return res.status(500).json({ error: "Failed to delete note by admin" });
    if (this.changes === 0)
      return res.status(404).json({ error: "Note not found" });
    res.status(200).json({ message: "Note deleted successfully by admin" });
  });
};
