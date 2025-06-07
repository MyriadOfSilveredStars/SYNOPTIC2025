const bcrypt = require("bcrypt");

const saltRounds = 12; //Number of rounds to use when hashing a password

//Hash param password and return the hash
exports.hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Internal server error");
    }
};

//Comparison check to see if input matches stored hash
exports.comparePassword = async (inputPassword, storedHash) => {
    try {
        return await bcrypt.compare(inputPassword, storedHash);
    } catch (error) {
        console.error("Error comparing passwords:", error);
        throw new Error("Internal server error");
    }
};

//$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
// |  |  |                     |
// |  |  |                     hash-value = K0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
// |  |  |
// |  |  salt = nOUIs5kJ7naTuTFkBy1veu
// |  |
// |  cost-factor = 10 = 2^10 iterations
// |
// hash-algorithm = 2b = BCrypt
