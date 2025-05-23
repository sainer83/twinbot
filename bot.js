const fs = require("fs");
const { OpenAI } = require("openai");
const axios = require("axios");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let memory = [];

try {
  const memoryRaw = fs.readFileSync("memory.json", "utf8");
  const parsed = JSON.parse(memoryRaw);
  memory = Array.isArray(parsed) ? parsed : [];
} catch (err) {
  console.warn("Could not read memory.json. Starting fresh.");
}

function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

async function askTwinBot(message) {
  memory.push({ role: "user", content: message });

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You're TwinBot, a supportive, emotionally-aware personal A.I." },
      ...memory,
    ],
  });

  const reply = chatCompletion.choices[0].message.content;
  memory.push({ role: "assistant", content: reply });
  saveMemory();

  return reply;
}

async function speakText(text) {
  const response = await axios({
    method: "POST",
    url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    responseType: "arraybuffer",
    data: {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    },
  });

  console.log("TTS response buffer size:", response.data.length);
  return Buffer.from(response.data); // send audio as a real Buffer
}

module.exports = { askTwinBot, speakText };