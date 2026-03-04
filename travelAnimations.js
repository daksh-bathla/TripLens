
let thinkingInterval;

// ✈️ AIRPLANE HEADER ANIMATION
function startPlaneAnimation() {
  const header = document.querySelector("h1");

  // prevent duplicate airplanes
  if (!header || document.querySelector(".plane-container")) return;

  const container = document.createElement("div");
  container.className = "plane-container";

  const plane = document.createElement("div");
  plane.className = "flying-plane";
  plane.textContent = "✈️";

  container.appendChild(plane);
  header.parentNode.insertBefore(container, header);
}


// 🌍 AI THINKING / PLANNING ANIMATION
function startAIThinkingAnimation(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const steps = [
    "🌍 Planning your journey...",
    "✈️ Finding best routes...",
    "📍 Checking destinations...",
    "🧠 Building itinerary..."
  ];

  let index = 0;

  // stop previous animation loop if it exists
  clearInterval(thinkingInterval);

  el.textContent = steps[index];

  thinkingInterval = setInterval(() => {
    index = (index + 1) % steps.length;
    el.textContent = steps[index];
  }, 1800);
}


// 🗺️ ROUTE DRAWING ANIMATION (source → destination)
function animateRoute(sourceId, destId, outputId) {
  const source = document.getElementById(sourceId)?.value;
  const dest = document.getElementById(destId)?.value;

  const el = document.getElementById(outputId);
  if (!el || !source || !dest) return;

  el.innerHTML = `
    <div style="font-size:18px; margin-top:10px">
      ${source}
      <span class="route-line">────────✈────────</span>
      ${dest}
    </div>
  `;

  const line = el.querySelector(".route-line");

  if (line) {
    line.style.display = "inline-block";
    line.style.overflow = "hidden";
    line.style.whiteSpace = "nowrap";
    line.style.width = "0px";
    line.style.transition = "width 1.2s ease";

    setTimeout(() => {
      line.style.width = "120px";
    }, 100);
  }
}


// 📍 MAP MARKER DROP ANIMATION (for Leaflet markers)
function dropMarker(marker) {
  if (!marker) return;

  const icon = marker.getElement();
  if (!icon) return;

  icon.style.transform = "translateY(-20px)";
  icon.style.opacity = "0";

  setTimeout(() => {
    icon.style.transition = "all 0.4s ease";
    icon.style.transform = "translateY(0)";
    icon.style.opacity = "1";
  }, 100);
}


// 🚀 INIT ALL ANIMATIONS
function initTravelAnimations() {
  startPlaneAnimation();
}


// run automatically when page loads
document.addEventListener("DOMContentLoaded", initTravelAnimations);