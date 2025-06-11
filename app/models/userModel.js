const mongoose = require("mongoose");
const general = require("../controllers/generalController");
const security = require("../controllers/securityController");
const crypto = require("crypto");

// user collection in MongoDB
const userSchema = new mongoose.Schema({
    id: { type: String, default: () => crypto.randomUUID() },
    email: { type: String, unique: true },
    password: String,
    verificationCode: String,
    verifiedAccount: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
});

//Forgotten password collection
const forgotPasswordSchema = new mongoose.Schema({
    email: String,
    oneTimeCode: String,
});

const User = mongoose.model("User", userSchema);
const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema);

// creates a new user and emails them a verification link
exports.signUp = async (req, res) => {
    const { email, password } = req.body;

    try {
        //creates a random ID for each new user
        const userId = crypto.randomUUID();
        //then hashes that ID for security
        const hashedUUID = await security.hashPassword(userId);
        //also hashes the password
        const hashedPassword = await security.hashPassword(password);

        //Generate a verification code
        const verificationCode = general.generateUniqueCode(6);

        //create a new user using the mongoose schema
        const newMember = new User({
            id: hashedUUID, //Needs to be hashed before being stored in the database for finding accounts via cookies
            email: email,
            password: hashedPassword,
            verificationCode: verificationCode,
        });

        //Send verification email
        const emailMessage = `
            Please click on the link to verify your account.\n\n
            <a href="http://localhost:3000/verifyAccount?email=${email}&code=${verificationCode}">Verify Account</a>\n\n
            Your verification code is '${verificationCode}'
        `;
        
        await general.sendEmail({
            to: email,
            subject: 'Account Verification',
            htmlContent: emailMessage
        });
        
        //save the new member to the database
        await newMember.save();

        return res.status(200).send("Account Created!");
    } catch (err) {
        console.error("Error during sign-up: ", err);
        return res.status(400).send("Error Occurred!");
    }
};

//finds a user by their email address
exports.findUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        console.log(user);
        return user;
    } catch (error) {
        console.error("Error reading database: ", error);
        throw error;
    }
};

// send a reset password link to email address
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res
                .status(400)
                .send(`Account with that email does not exist`);
        }

        const uniqueUserCode = general.generateUniqueCode();

        const forgotPasswordEntry = { email, oneTimeCode: uniqueUserCode };

        // save the forgot password entry to the database
        const fpData = new ForgotPassword(forgotPasswordEntry);
        await fpData.save();

        const emailMessage = `
            Please click on the link to reset your password.\n\n
            <a href="http://localhost:3000/reset-password?code=${uniqueUserCode}">Change Password</a>\n\n
            Your verification code to change your password is '${uniqueUserCode}'
        `;

        await general.sendEmail({
            to: email,
            subject: "Password Reset",
            htmlContent: emailMessage,
        });

        return res.status(200).send("Reset link sent to email.");
    } catch (err) {
        console.log("Error processing forgot-password: ", err);
        return res.status(500).send("Error Occurred");
    }
};

//verifies a user's account
exports.verifyAccount = async (email, code) => {
    try {
        const user = await User.findOne({
            email: email,
            verificationCode: code,
        });
        if (!user) {
            return {
                success: false,
                message: "Verification Failed: Invalid Code or Email.",
            };
        }

        user.verifiedAccount = true;
        user.verificationCode = undefined;

        await user.save();

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Internal Server Error" };
    }
};

//handles the user resetting their password
exports.resetPassword = async (uniqueCode, newPassword) => {
    try {
        const resetEntry = await ForgotPassword.findOne({
            oneTimeCode: uniqueCode,
        });

        if (!resetEntry) {
            return { success: false, message: "Reset Failed: Invalid Code." };
        }

        const userEmail = resetEntry.email;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return { success: false, message: "Email not found in database." };
        }

        const newHashedPassword = await security.hashPassword(newPassword);
        user.password = newHashedPassword;
        await user.save();

        await ForgotPassword.deleteOne({ oneTimeCode: uniqueCode });

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Internal Server Error" };
    }
};
