const mongoose = require("mongoose");
const general = require("../controllers/generalController");
const security = require("../controllers/securityController");
const crypto = require("crypto");

const markerSchema = new mongoose.Schema({
    id: { type: String, default: () => crypto.randomUUID() },
    position: {
        lat: Number,
        lng: Number,
    },
    creator: String,
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    description: String,
    markerDate: Date,
    markerType: String,
    upVoterList: { type: Array, default: [] },
    downVoterList: { type: Array, default: [] },
});

const Marker = mongoose.model("Marker", markerSchema);

module.exports = Marker;
