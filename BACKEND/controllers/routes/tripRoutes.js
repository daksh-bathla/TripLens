const express = require("express");
const router = express.Router();

/**
 * Trip Controller functions
 * These handle the actual logic for each route
 */
const { createTrip, getTrips, deleteTrip } = require("../tripController");

/**
 * Future middleware (example)
 * const validateTrip = require("../../middlewares/validateTrip");
 * router.post("/", validateTrip, createTrip);
 */

/**
 * Create a new trip
 * Endpoint: POST /trips
 * Used when user plans a new journey from dashboard
 */
router.post("/", createTrip);

/**
 * Fetch all trips
 * Endpoint: GET /trips
 * Used by analytics, recent trips, and dashboard stats
 */
router.get("/", getTrips);

/**
 * Delete a trip by ID
 * Endpoint: DELETE /trips/:id
 * Used in the Recent Trips page
 */
router.delete("/:id", deleteTrip);

/**
 * Future route (editing trips)
 * Endpoint: PUT /trips/:id
 * Example:
 * router.put("/:id", updateTrip);
 * This would allow users to edit budget, travel mode, etc.
 */
module.exports = router;
