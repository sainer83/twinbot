const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const micButton = document.getElementById("mic-button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  try {
    const res = await fetch("/twinbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();
    addMessage(data.reply, "bot");

    const ttsRes = await fetch("/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: data.reply }),
    });

    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error("Error talking to TwinBot:", err);
    addMessage("Oops, something went wrong talking to my twin brain.", "bot");
  }
});

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// Speech recognition
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;

  micButton.addEventListener("click", () => {
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    form.dispatchEvent(new Event("submit"));
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    addMessage("Mic error. Try again or type it out.", "bot");
  };
} else {
  micButton.disabled = true;
  micButton.innerText = "X";
  addMessage("Mic not supported in this browser.", "bot");
}