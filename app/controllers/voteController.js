const Marker = require("../models/markerModel");
const jsonData = {
    upvotes: 0,
    downvotes: 0,
    markerID: "",
};
//downvote logging in console to check it is being recieved
exports.upvote = async (req, res) => {
    jsonData.markerID = req.body.markerID;
    jsonData.upvotes = 0;
    jsonData.downvotes = 0;
    const markerID = req.body.markerID;
    const userID = req.body.userID;

    const voteWeight = req.user && req.user.verifiedAccount ? 2 : 1;//Weight for verified users

    console.log(`${userID} attempting upvote on ${markerID}`);
    try {
        const marker = await Marker.findOne({ id: markerID });
        //check if name in upvote list
        voteIndex = marker.upVoterList.indexOf(userID);
        //if its not in upvotes
        if (voteIndex == -1) {
            console.log("user id not in upvotes");
            voteIndex = marker.downVoterList.indexOf(userID);
            //if in downvotes
            if (voteIndex != -1) {
                console.log("user id in downvotes");
                marker.downVoterList.splice(voteIndex, 1);
                marker.downvotes -= voteWeight;
                console.log("removed downvote");
                jsonData.downvotes = -voteWeight;
            }
            marker.upVoterList.push(userID);
            marker.upvotes += voteWeight;
            console.log("added upvote");
            jsonData.upvotes = voteWeight;
        } else {
            //if its in upvotes
            console.log("user id in upvotes");
            marker.upVoterList.splice(voteIndex, 1);
            marker.upvotes -= voteWeight;
            console.log("removed upvote");
            jsonData.upvotes = -voteWeight;
        }
        const savedMarker = await marker.save();
        console.log("saved changes");

        try {
            const savedMarker = await marker.save();
            console.log("saved changes");
            return res.send(jsonData);
        } catch (err) {
            console.error("Error modifying upvotes: ", err);
            return res.status(400).send("Error Occurred!");
        }
    } catch (err) {
        console.error("Error modifying votes: ", err);
        return res.status(400).send("Error Occurred!");
    }
};
//downvote logging in console to check it is being recieved
exports.downvote = async (req, res) => {
    jsonData.markerID = req.body.markerID;
    jsonData.upvotes = 0;
    jsonData.downvotes = 0;
    const markerID = req.body.markerID;
    const userID = req.body.userID;

    const voteWeight = req.user && req.user.verifiedAccount ? 2 : 1;//Weight for verified users

    console.log(`${userID} attempting downvote on ${markerID}`);
    try {
        const marker = await Marker.findOne({ id: markerID });
        //check if name in upvote list
        voteIndex = marker.downVoterList.indexOf(userID);
        //if its not in downvotes
        if (voteIndex == -1) {
            console.log("user id not in downvotes");
            voteIndex = marker.upVoterList.indexOf(userID);
            //if in upvotes
            if (voteIndex != -1) {
                console.log("user id in upvotes");
                marker.upVoterList.splice(voteIndex, 1);
                marker.upvotes -= voteWeight;
                console.log("removed upvote");
                jsonData.upvotes = -voteWeight;
            }
            marker.downVoterList.push(userID);
            marker.downvotes += voteWeight;
            console.log("added downvote");
            jsonData.downvotes = voteWeight;
        } else {
            //if its in downvotes
            console.log("user id in downvotes");
            marker.downVoterList.splice(voteIndex, 1);
            marker.downvotes -= voteWeight;
            console.log("removed downvote");
            jsonData.downvotes = -voteWeight;
        }

        try {
            const savedMarker = await marker.save();
            console.log("saved changes");
            return res.send(jsonData);
        } catch (err) {
            console.error("Error modifying upvotes: ", err);
            return res.status(400).send("Error Occurred!");
        }
    } catch (err) {
        console.error("Error modifying votes: ", err);
        return res.status(400).send("Error Occurred!");
    }
};
