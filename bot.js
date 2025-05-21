const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const memoryFile = "memory.json";

// Load memory
let memory = [];
if (fs.existsSync(memoryFile)) {
  try {
    const data = fs.readFileSync(memoryFile, "utf8");
    memory = JSON.parse(data);
  } catch (error) {
    console.error("Error reading memory:", error);
  }
}

// Save memory to disk
const saveMemory = () => {
  try {
    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("Error saving memory:", error);
  }
};

async function askTwinBot(userMessage) {
  memory.push({ role: "user", content: userMessage });

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo", // or "gpt-4" if you're using GPT-4
    messages: memory,
  });

  const reply = response.data.choices[0].message.content.trim();
  memory.push({ role: "assistant", content: reply });

  saveMemory();

  return reply;
}

module.exports = askTwinBot;