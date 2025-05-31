// Imports
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Needed for gcloud
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middleware/authMiddleware');
const _ = require("lodash"); //for flattening mongo objects into arrays

// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tyb23mnu:NHplzJDtvulUoyCC@synoptic.f2e5msh.mongodb.net/?retryWrites=true&w=majority&appName=Synoptic', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware
const jsonParser = bodyParser.json();
app.use(express.static('public')); // Used to serve static files (css, js)
app.use(cookieParser()); // Used to parse cookies

// Setting up ejs for rendering
app.set('view engine', 'ejs'); // Express looks in views folder for ejs templates

// Import controllers and models
const authController = require('./controllers/authController');
const userModel = require('./models/userModel');
const markerModel = require('./models/markerModel');

// Rendering pages with ejs using layout.ejs
function EJSrender(res, main, titleIn, params) {
    res.render('layout.ejs', { mainContent: main, title: titleIn, includeParams: params });
}

// Routes
app.get('/', (req, res) => {
    EJSrender(res, 'pages/index', 'Home');
});

app.get('/sign-up', (req, res) => {
    EJSrender(res, 'pages/sign-up', 'Sign Up');
});

app.get('/reset-password', (req, res) => {
    EJSrender(res, 'pages/reset-password', 'Reset Password');
});

app.get('/log-in', (req, res) => {
    EJSrender(res, 'pages/log-in', 'Log In');
});

app.get('/policy', (req, res) => {
    EJSrender(res, 'pages/policy', 'Policy');
});

app.get('/map', async (req, res) => {

    //use the mongoose model to fetch all marker values from DB
    const markersModel = mongoose.model('Marker');
    let allMarkers = await markersModel.find();

    //now we use lodash to flatten the object of objects that mongo returns
    //into a nice array of objects instead
    const flattenMarkers = _(allMarkers).flatten().value();
    //console.log(flattenMarkers) //check if the markers are alright with this

    
    //okay that gives us flattenMarkers as an array of all markers in the database
    //now to send that to the map
    res.header("markers", JSON.stringify(flattenMarkers));
    EJSrender(res, 'pages/map', 'Map', { API_URL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDx1nDqigjyOixfMY4kj485EaIkEi1VXX0&loading=async&callback=initMap"});
});



app.get('/settings', isAuthenticated, async (req, res) => {
    const user = req.user;

    EJSrender(res, 'pages/settings', 'Settings', goal);
});

// Routing
app.post('/sign-up', jsonParser, userModel.signUp);
app.post('/forgot-password', jsonParser, userModel.forgotPassword);
app.post('/settings', jsonParser, userModel.updateUserDetails);
app.post('/log-in', jsonParser, authController.logIn);
app.get('/verifyAccount', jsonParser, authController.verifyAccount);
app.post('/resetPassword', jsonParser, authController.resetPassword);
app.post('/map', jsonParser, markerModel.newMarker);

// 404 Handler
app.use((req, res) => {
		res.status(404).send("Page Not Found");
	}
);

// Start server
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
