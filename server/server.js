const express = require("express");
const cors = require("cors");
require("dotenv").config();
const getAIResponse = require("./groq");
const tasks = require("./tasks.json");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dabble server is running!");
});

// Random task(s): /api/tasks/random returns one task, ?count=n returns n distinct tasks
app.get("/api/tasks/random", (req, res) => {
  const count = Math.min(Math.max(parseInt(req.query.count, 10) || 0, 0), tasks.length);
  const pool = [...tasks].sort(() => Math.random() - 0.5);
  if (!count) return res.json(pool[0]);
  res.json(pool.slice(0, count));
});

// Chat with Dabble AI
app.post("/api/chat", async (req, res) => {
  try {
    const { task, question, history = [] } = req.body;
    if (!task || !question) {
      return res.status(400).json({
        message: "Task and question are required."
      });
    }
    const reply = await getAIResponse(task, question, history);
    res.json({ reply });

  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again."
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Dabble server running on port ${PORT}`);
});
