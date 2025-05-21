const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Load memory from file
let memory = [];
try {
  const memoryData = fs.readFileSync("memory.json", "utf8");
  memory = JSON.parse(memoryData);
} catch (err) {
  console.error("Failed to load memory.json:", err);
}

// Save to memory file
function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

async function askTwinBot(message) {
  memory.push({ role: "user", content: message });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You're TwinBot, a supportive personal AI." },
      ...memory,
    ],
  });

  const reply = completion.data.choices[0].message.content;
  memory.push({ role: "assistant", content: reply });

  saveMemory();

  return reply;
}

module.exports = askTwinBot;