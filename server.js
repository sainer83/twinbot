const express = require("express");
const cors = require("cors");
const app = express();
const askTwinBot = require("./bot");
require("dotenv").config();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.static("public"));

app.post("/twinbot", async (req, res) => {
  const userMessage = typeof req.body === "string" ? req.body : req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided." });
  }

  const botReply = await askTwinBot(userMessage);
  res.json({ reply: botReply });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TwinBot is listening at http://localhost:${PORT}`);
});