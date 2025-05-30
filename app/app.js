// Imports
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Needed for gcloud
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middleware/authMiddleware');
const _ = require('lodash');

// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://rhoboat:1nc0rr3ct@courseworkdatabase.cfhqxbf.mongodb.net/?retryWrites=true&w=majority&appName=CourseworkDatabase', {
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

app.get('/map', (req, res) => {
    EJSrender(res, 'pages/map', 'Map', { API_URL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDx1nDqigjyOixfMY4kj485EaIkEi1VXX0&loading=async&callback=initMap" });
});

app.get('/user-profile', isAuthenticated, async (req, res) => {
    const user = req.user;
    const profile = {
        name: user.fName,
        surname: user.lName,
        profile: user.userProfile,
    };
    EJSrender(res, 'pages/user-profile', 'User Profile', profile);
});

app.get('/delete-account', (req, res) => {
    EJSrender(res, 'pages/delete-account', 'Account Deletion');
});

app.get('/settings', isAuthenticated, async (req, res) => {
    const user = req.user;

    const goal = {
        name: user.fName,
        surname: user.lName,
        gender: user.gender,
        birth: user.bday,
        height: user.height,
        weight: user.weight,
        precons: user.precons,
        profile: user.userProfile,
        email: user.email,
    };

    EJSrender(res, 'pages/settings', 'Settings', goal);
});

// Routing
app.post('/sign-up', jsonParser, userModel.signUp);
app.post('/forgot-password', jsonParser, userModel.forgotPassword);
app.post('/settings', jsonParser, userModel.updateUserDetails);
app.post('/log-in', jsonParser, authController.logIn);
app.get('/verifyAccount', jsonParser, authController.verifyAccount);
app.post('/resetPassword', jsonParser, authController.resetPassword);

// 404 Handler
app.use((req, res) => {
		res.status(404).send("Page Not Found");
	}
);

// Start server
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
