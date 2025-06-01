const mongoose = require('mongoose');
const general = require('../controllers/generalController');
const security = require('../controllers/securityController');
const crypto = require('crypto');

const markerSchema = new mongoose.Schema({
    id: { type: String, default: () => crypto.randomUUID() },
    position: {
        lat: Number,
        lng: Number,
    },
    creator: String,
    upvotes: {type: Number, default: 0},
    downvotes: {type: Number, default: 0},
    description: String
});

const Marker = mongoose.model('Marker', markerSchema);

exports.newMarker = async (req, res) => {
    const {position, creator, description} = req.body;

    try {
        //create a new marker using the schema
        const newMarker = new Marker({
            id: crypto.randomUUID(),
            position: position,
            creator: creator,
            description: description
        });

        await newMarker.save();

        return res.status(200).json(newMarker);

    } catch (err) {
        console.error("Error adding marker: ", err);
        return res.status(400).send("Error Occurred!");
    }

}

let testPos = {lat: -26.20818987447669, long: 28.03096522520447};

const testMarker = new Marker({
    position: testPos,
    creator: "testCreator",
    upvotes: 0,
    downvotes: 0,
    description: "This is a test marker. It probably won't show on the map"
});
