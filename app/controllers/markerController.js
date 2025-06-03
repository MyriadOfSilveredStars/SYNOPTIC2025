const Marker = require('../models/markerModel');
const crypto = require('crypto');

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