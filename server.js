require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Personal Notes API is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
