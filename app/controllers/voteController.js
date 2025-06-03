const Marker = require('../models/markerModel');
//downvote logging in console to check it is being recieved
exports.upvote = async (req, res) => {
    console.log("upvote")
    const markerID = req.body.markerID;
    const userID = req.body.userID;
    console.log(markerID, userID);
    const marker = await Marker.findOne({id: markerID});
    //check if name in database for either upvote or downvote
    console.log(marker);
    marker.upVoterList.push(userID);
    console.log(marker);
    const savedMarker=await marker.save();
    //if in upvote remove from upvote
    


    //if in downvote remove from downvote
    

}
//downvote logging in console to check it is being recieved
exports.downvote = async (req, res) => {
    console.log("downvote")
    const markerID = req.body.markerID;
    const userID = req.body.userID;
    console.log(markerID, userID);
}