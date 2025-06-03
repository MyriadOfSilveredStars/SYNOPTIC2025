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
    description: String,
    markerDate: Date,
    markerType: String,
    voterList: Array
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
            description: description,
            markerDate: new Date(8.64e15).toString(),
            markerType: "test type",
            voterList: []
        });

        await newMarker.save();

        return res.status(200).json(newMarker);

    } catch (err) {
        console.error("Error adding marker: ", err);
        return res.status(400).send("Error Occurred!");
    }

}


