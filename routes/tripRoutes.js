const express = require("express");
const router = express.Router();

const { createTrip, getTrips, deleteTrip } = require("../controllers/tripController");

// Create a new trip
router.post("/", createTrip);

// Get all trips
router.get("/", getTrips);

// Delete a trip
router.delete("/:id", deleteTrip);

module.exports = router;
