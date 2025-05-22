const fs = require("fs");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load memory
let memory = [];
try {
  const data = fs.readFileSync("memory.json", "utf8");
  memory = JSON.parse(data);
} catch (err) {
  console.warn("Could not load memory.json, starting fresh:", err.message);
}

// Save memory
function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

async function askTwinBot(message) {
  memory.push({ role: "user", content: message });

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You're TwinBot, a supportive, emotionally-aware personal AI." },
      ...memory,
    ],
  });

  const reply = chatCompletion.choices[0].message.content;
  memory.push({ role: "assistant", content: reply });
  saveMemory();

  return reply;
}

module.exports = askTwinBot;