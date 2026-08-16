const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

/* ==========================================
   LOGIN (STRICT CASE-SENSITIVE AUTHENTICATION)
========================================== */
async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Generic error message for all authentication failures
        const genericErrorMessage = "Invalid username or password.";

        if (!username || typeof username !== "string" || !password || typeof password !== "string") {
            return res.status(401).json({
                success: false,
                message: genericErrorMessage
            });
        }

        // Direct lookup with exact username string (no lowercase, no uppercase, no trim)
        const user = await User.findByUsername(username);

        if (!user || user.username !== username) {
            return res.status(401).json({
                success: false,
                message: genericErrorMessage
            });
        }

        // Direct bcrypt verification with exact password string (no lowercase, no uppercase, no trim)
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(401).json({
                success: false,
                message: genericErrorMessage
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                business_name: user.business_name,
                owner_name: user.owner_name,
                username: user.username,
                phone: user.phone,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

module.exports = {
    login
};