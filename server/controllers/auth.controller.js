const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

/* ==========================================
   LOGIN
========================================== */

async function login(req, res) {

    try {

        const { username, password } = req.body;

        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message: "Username and password are required."

            });

        }

        const user = await User.findByUsername(username);

        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password."

            });

        }

        const passwordMatched = await bcrypt.compare(

            password,

            user.password

        );

        if (!passwordMatched) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password."

            });

        }

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

    }

    catch (error) {

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