require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Auto-create table on startup
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        done BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Database ready");
  } catch (err) {
    console.error("Database connection error:", err.message);
    console.log(
      "Server running but database is unavailable. Please check your PostgreSQL connection.",
    );
  }
};
initDB();

// GET all todos
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create todo
app.post("/todos", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required" });
    const result = await pool.query(
      "INSERT INTO todos (task) VALUES ($1) RETURNING *",
      [task],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update todo (edit task text or toggle done)
app.put("/todos/:id", async (req, res) => {
  try {
    const { task, done } = req.body;
    const result = await pool.query(
      "UPDATE todos SET task = COALESCE($1, task), done = COALESCE($2, done) WHERE id = $3 RETURNING *",
      [task, done, req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Todo not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
