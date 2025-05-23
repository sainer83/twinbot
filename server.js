const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const { askTwinBot, speakText } = require("./bot");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.static("public"));

// Handle incoming chat messages
app.post("/twinbot", async (req, res) => {
  const userMessage = typeof req.body === "string" ? req.body : req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided." });
  }

  try {
    const botReply = await askTwinBot(userMessage);
    res.json({ reply: botReply });
  } catch (err) {
    console.error("Error generating TwinBot reply:", err);
    res.status(500).json({ error: "Failed to generate reply." });
  }
});

// Handle text-to-speech
app.post("/speak", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided for TTS." });
  }

  console.log("Received text to speak:", text);

  try {
    const audioBuffer = await speakText(text);
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (err) {
    console.error("Error generating speech:", err);
    res.status(500).json({ error: "Failed to generate speech." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TwinBot is listening at http://localhost:${PORT}`);
});