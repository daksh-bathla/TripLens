// Detect travel personality from past trips
function detectTravelPersonality(trips = []) {
  if (!trips.length) return "Balanced Traveler";

  let adventure = 0;
  let luxury = 0;
  let budget = 0;

  trips.forEach(t => {
    const style = (t.style || "").toLowerCase();

    if (style.includes("adventure")) adventure++;
    if (style.includes("luxury")) luxury++;
    if (style.includes("budget")) budget++;
  });

  if (adventure > luxury && adventure > budget) return "Adventure Traveler";
  if (luxury > adventure && luxury > budget) return "Luxury Explorer";
  if (budget > adventure && budget > luxury) return "Budget Backpacker";

  return "Balanced Traveler";
}

// Builds a structured AI prompt for itinerary generation
function buildPrompt(trip, historyContext = "", locationHint = "") {
  const days = trip.days || 3;
  const source = trip.source || "Unknown";
  const destination = trip.destination || "Unknown";
  const mode = trip.mode || "Flight";
  const budget = trip.budget || 15000;
  const style = trip.style || "balanced";

  const personality = detectTravelPersonality(trip.history || []);

  // Trip memory summary from past trips
  let memory = "";
  if (trip.history && trip.history.length) {
    const recent = trip.history.slice(0,3)
      .map(t => `${t.source || ""} to ${t.destination || ""}`)
      .join(", ");

    memory = `Recent trips: ${recent}`;
  }

  const dailyBudget = Math.round(budget / days);

  return `
You are a smart travel planner AI.

Create a ${days}-day travel itinerary.

Route: ${source} → ${destination}
Travel Mode: ${mode}
Total Budget: ₹${budget}
Daily Budget: ₹${dailyBudget}
Travel Style: ${style}
Traveler Personality: ${personality}
${memory}

${historyContext}

${locationHint}

Return the itinerary in this format:

Day 1
- Activity
- Activity

Day 2
- Activity
- Activity

Day 3
- Activity
- Activity

Rules:
- Keep activities realistic within the daily budget
- Include food, attractions, and exploration
- Avoid repeating locations
- Keep descriptions short
`;
}

module.exports = {
  buildPrompt,
  detectTravelPersonality
};