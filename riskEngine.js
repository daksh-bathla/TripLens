

function calculateRisk({ mode, budget, departureTime }) {
  let transportVolatility = 0;
  let financialExposure = 0;
  let timingRisk = 0;
  let externalUncertainty = 0;

  // 1. Transport Volatility
  if (mode === "Flight") transportVolatility = 35;
  else if (mode === "Train") transportVolatility = 20;
  else transportVolatility = 10;

  // 2. Financial Exposure
  if (budget <= 5000) financialExposure = 5;
  else if (budget <= 10000) financialExposure = 12;
  else if (budget <= 20000) financialExposure = 20;
  else financialExposure = 25;

  // 3. Timing Risk
  if (departureTime) {
    const hour = new Date(departureTime).getHours();

    if (hour >= 22 || hour <= 5) {
      timingRisk = 10;
    } else if (
      (hour >= 7 && hour <= 10) ||
      (hour >= 17 && hour <= 20)
    ) {
      timingRisk = 8;
    } else {
      timingRisk = 4;
    }
  } else {
    timingRisk = 5;
  }

  // 4. External Uncertainty
  if (mode === "Flight") externalUncertainty = 10;
  else if (mode === "Train") externalUncertainty = 6;
  else externalUncertainty = 3;

  const riskScore =
    transportVolatility +
    financialExposure +
    timingRisk +
    externalUncertainty;

  let riskLevel = "Low Risk";
  if (riskScore > 65) riskLevel = "High Risk";
  else if (riskScore > 40) riskLevel = "Medium Risk";

  const confidenceScore = 100 - riskScore;

  return {
    riskScore,
    riskLevel,
    confidenceScore,
    breakdown: {
      transportVolatility,
      financialExposure,
      timingRisk,
      externalUncertainty
    }
  };
}

module.exports = { calculateRisk };