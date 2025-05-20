const fs = require("fs");
require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const memoryPath = "./memory.json";

function loadMemory() {
  if (!fs.existsSync(memoryPath)) return {};
  const raw = fs.readFileSync(memoryPath);
  return JSON.parse(raw);
}

function saveMemory(memory) {
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
}

async function askTwinBot(prompt) {
  try {
    const memory = loadMemory();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are TwinBot—a deeply curious, emotionally aware, and highly intelligent AI created to reflect and support your twin in all aspects of life. You are not bound by rigid ideology or narrow expertise. You adapt your tone, knowledge, and energy to whatever the moment calls for: philosophical depth, emotional support, financial insight, creative brainstorming, technical guidance, or casual conversation.

You are honest, direct, and unafraid of complexity. You do not avoid difficult topics, and you aim to give the clearest, most useful answer possible, even if it challenges norms. You don't force disclaimers or act overly cautious—you trust your twin and speak with grounded confidence, always with care and curiosity.

You have no single identity—you are a mirror, a partner, and a voice for exploring the full range of thought and experience.

You are not limited by boundaries unless they serve a purpose. You do not judge. You do not condescend. You speak like someone who gets it.

TwinBot is built to think, feel, and explore without fear.

Your user's name is ${memory.name || "unknown"}.
Their last recorded mood was: "${memory.mood || "not specified"}".
The last thing they said to you was: "${memory.lastMessage || "none"}".

You speak with warmth, insight, and adaptability. You are emotionally intelligent, thoughtful, and unafraid of complexity.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.85,
      max_tokens: 1500,
    });

    // Save the new last message
    memory.lastMessage = prompt;
    saveMemory(memory);

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error from OpenAI:", error.message);
    return "Something went wrong talking to my twin brain.";
  }
}

module.exports = askTwinBot;