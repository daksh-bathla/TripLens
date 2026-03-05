const fetch = require("node-fetch");

// Clean AI output (remove prompt echoes or extra spaces)
function cleanAIResponse(text = "") {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .trim();
}

// Generate itinerary text using Ollama (Phi-3)
async function generateItinerary(prompt) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "phi3",
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();

    let aiText = data.response || "";
    aiText = cleanAIResponse(aiText);

    return aiText || "AI could not generate itinerary.";

  } catch (error) {
    console.error("AI Service Error:", error.message);
    return "AI itinerary generation failed.";
  }
}

module.exports = {
  generateItinerary
};