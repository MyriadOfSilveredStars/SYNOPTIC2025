const userModel = require("../models/userModel");
const fs = require("fs");
const crypto = require("crypto");
const security = require("./securityController");

exports.logIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).send("Email not found.");
        }
        if (!(await security.comparePassword(password, user.password))) {
            //If hashed pass doesnt match entered, return error
            return res.status(400).send("Incorrect Password.");
        }

        //Generate a session token (Hashed UUID)
        const sessionToken = user.id;

        //Set the session token as a cookie
        res.cookie("sessionToken", sessionToken, {
            httpOnly: false, //Setting true breaks cookie functionality
            secure: false,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        console.log("Cookie set: Success");

        res.status(200).send("Successfully Logged In.");
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.verifyAccount = async (req, res) => {
    const { email, code } = req.query;
    try {
        const result = await userModel.verifyAccount(email, code);
        if (result.success) {
            res.send(
                "Account Verified Successfully!\nYou may now close this page."
            );
        } else {
            res.status(400).send(
                result.message || "Verification Failed: Invalid Code or Email."
            );
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error.");
    }
};

exports.resetPassword = async (req, res) => {
    const { uniqueCode, newPassword } = req.body;
    try {
        const newHashedPassword = await security.hashPassword(newPassword);
        const result = await userModel.resetPassword(
            uniqueCode,
            newHashedPassword
        );
        if (result.success) {
            res.status(200).send("Password Changed!");
        } else {
            res.status(400).send(
                result.message || "Reset Failed: Invalid Code."
            );
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error.");
    }
};
