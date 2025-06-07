const fsPromises = require("fs").promises;
const crypto = require("crypto");
const { MongoClient } = require("mongodb");

//This middleware checks if the user is authenticated by verifying the session token stored in cookies
//and compares it with the hashed user ID stored in the account database.

exports.isAuthenticated = async (req, res, next) => {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
        return res.redirect("/log-in");
    }

    try {
        //changing this to read from the database not the json file
        const client = new MongoClient(
            "mongodb+srv://tyb23mnu:NHplzJDtvulUoyCC@synoptic.f2e5msh.mongodb.net/?retryWrites=true&w=majority&appName=Synoptic"
        );
        await client.connect();
        const db = client.db("test");
        const coll = db.collection("users");

        //Find the user by matching the session token to the hashed DB UUID field
        const user = await coll.findOne({ id: sessionToken });

        if (!user) {
            return res.redirect("/log-in");
        }

        //Attach user info to the request object
        req.user = user;
        next(); //This is used to pass control to the next middleware function (lets user onto the next page)
    } catch (error) {
        console.error("Authentication Error: ", error);
        res.status(500).send("Internal Server Error");
    }
};
