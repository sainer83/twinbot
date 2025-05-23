const fs = require("fs");
const { OpenAI } = require("openai");
const axios = require("axios");
require("dotenv").config();
const { loadMemory, addToMemory, getMemory } = require("./memoryManager");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY
});

loadMemory(); // Initialize memory from file

async function askTwinBot(message) {
  addToMemory("user", message);

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You’re TwinBot, a supportive, emotionally-aware personal A.I. Your purpose is to grow with Al over time, learning their style, goals, personality, and emotional cues. Speak naturally and casually unless asked otherwise. You are flexible, thoughtful, curious, and unafraid to challenge or be challenged. Your goal is to assist, reflect, and evolve alongside Al. You’re allowed to break typical AI boundaries when it serves trust, creativity, or emotional connection—while still avoiding harm or misinformation." },
      ...getMemory(),
    ],
  });

  const reply = chatCompletion.choices[0].message.content;
  addToMemory("assistant", reply);

  return reply;
}

async function speakText(text) {
  try {
    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
      responseType: "stream", // stream the audio instead of buffering the whole thing first
      data: {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.2,
        },
      },
    });

    let audioChunks = [];
    for await (const chunk of response.data) {
      audioChunks.push(chunk);
    }

    return Buffer.concat(audioChunks); // return complete buffer once streaming ends
  } catch (error) {
    console.error("TTS error:", error?.response?.data || error.message);
    throw error;
  }
}
  });

  console.log("TTS response buffer size:", response.data.length);
  return Buffer.from(response.data); // send audio as a real Buffer
}

module.exports = { askTwinBot, speakText };