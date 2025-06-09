// Imports
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000; // Needed for gcloud
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { isAuthenticated } = require("./middleware/authMiddleware");
const _ = require("lodash"); //for flattening mongo objects into arrays

// MongoDB connection
const mongoose = require("mongoose");
mongoose
    .connect(
        "mongodb+srv://tyb23mnu:NHplzJDtvulUoyCC@synoptic.f2e5msh.mongodb.net/?retryWrites=true&w=majority&appName=Synoptic",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Middleware
const jsonParser = bodyParser.json();
app.use(express.static("public")); // Used to serve static files (css, js)
app.use(cookieParser()); // Used to parse cookies

// Setting up ejs for rendering
app.set("view engine", "ejs"); // Express looks in views folder for ejs templates

// Import controllers and models
const authController = require("./controllers/authController");
const voteController = require("./controllers/voteController");
const markerController = require("./controllers/markerController");
const userModel = require("./models/userModel");
//const markerModel = require('./models/markerModel');

// Rendering pages with ejs using layout.ejs
function EJSrender(res, main, titleIn, params) {
    res.render("layout.ejs", {
        mainContent: main,
        title: titleIn,
        includeParams: params,
    });
}

// Routes
app.get("/", (req, res) => {
    EJSrender(res, "pages/index", "Home");
});

app.get("/account", (req, res) => {
    EJSrender(res, "pages/account", "Your Account");
});

app.get("/sign-up", (req, res) => {
    EJSrender(res, "pages/sign-up", "Sign Up");
});

app.get("/reset-password", (req, res) => {
    EJSrender(res, "pages/reset-password", "Reset Password");
});

app.get("/log-in", (req, res) => {
    EJSrender(res, "pages/log-in", "Log In");
});

app.get("/policy", (req, res) => {
    EJSrender(res, "pages/policy", "Policy");
});

app.get("/map", isAuthenticated ,async (req, res) => {
    //use the mongoose model to fetch all marker values from DB
    const markersModel = mongoose.model("Marker");
    let allMarkers = await markersModel.find();

    //now we use lodash to flatten the object of objects that mongo returns
    //into a nice array of objects instead
    const flattenMarkers = _(allMarkers).flatten().value();
    //console.log(flattenMarkers) //check if the markers are alright with this

    //Gets the users admin status
    const isAdmin = req.user && req.user.isAdmin ? true : false;
    const isVerified = req.user && req.user.verifiedAccount ? true : false;

    //okay that gives us flattenMarkers as an array of all markers in the database
    //now to send that to the map
    EJSrender(res, "pages/map", "Map", {
        API_URL:
            "https://maps.googleapis.com/maps/api/js?key=AIzaSyDx1nDqigjyOixfMY4kj485EaIkEi1VXX0&loading=async&callback=initMap",
        markers: JSON.stringify(flattenMarkers),
        isAdmin: isAdmin,
        isLoggedIn: req.cookies.sessionToken ? true : false,
        isVerified: isVerified,
    });
});

app.delete("/map/:id", async (req, res) => {
    const markerId = req.params.id;

    try {
        const markersModel = mongoose.model("Marker");
        await markersModel.deleteOne({ id: markerId });
        res.status(200).send({ success: true });
    } catch (err) {
        //Potential vulnerability: Do not expose error details in production
        res.status(500).send({ success: false, error: err.message });
    }
});

//API endpoint to get all markers (used by map for updating markers instead of page refresh)
app.get("/api/markers", async (req, res) => {
    const markersModel = mongoose.model("Marker");
    let allMarkers = await markersModel.find();
    const flattenMarkers = _(allMarkers).flatten().value();
    res.status(200).json(flattenMarkers);
});

// Routing
app.post("/sign-up", jsonParser, userModel.signUp);
app.post("/forgot-password", jsonParser, userModel.forgotPassword);
app.post("/log-in", jsonParser, authController.logIn);
app.get("/verifyAccount", jsonParser, authController.verifyAccount);
app.post("/resetPassword", jsonParser, authController.resetPassword);
app.post("/map", jsonParser, markerController.newMarker);
app.post("/upvote", isAuthenticated, jsonParser, voteController.upvote);
app.post("/downvote", isAuthenticated, jsonParser, voteController.downvote);

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Start server
app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
