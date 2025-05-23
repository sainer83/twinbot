const fs = require("fs");
const path = "memory.json";

let memory = [];

function loadMemory() {
  try {
    const raw = fs.readFileSync(path, "utf8");
    memory = JSON.parse(raw);
  } catch {
    memory = [];
  }
}

function saveMemory() {
  fs.writeFileSync(path, JSON.stringify(memory, null, 2));
}

function addToMemory(role, content) {
  memory.push({ role, content });

  // Trim to the last 10 messages (5 back-and-forths)
  if (memory.length > 20) memory = memory.slice(-20);

  saveMemory();
}

function getMemory() {
  return memory;
}

module.exports = { loadMemory, addToMemory, getMemory };