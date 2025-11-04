import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import User from '../models/user.js'

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "all the fields are required",
            })
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered please signup first",
            })
        }

        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "30d",
            })

            user.token = token;
            user.password = password;

            const options = {
                expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,

            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "user logged in successfully",
            })

        }

        else {
            return res.status(401).json({
                success: false,
                message: "password is incorrect",
            })
        }
    } catch (error) {
        console.log("Error occurred while logging in : ", error);
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again",
        })
    }
}

export const signup = async (req, res) => {
    try {

        const { email, password, firstName, lastName,accountType } = req.body;

        if (!email || !password || !firstName || !lastName || !accountType) {
            return res.status(401).json({
                success: false,
                message: "all fields are required"
            })
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                success: false,
                message: "user already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = await User.create({
            firstName,
            lastName,
            email,
            accountType,
            password: hashedPassword,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success: true,
            message: "user registered successfully",
            userData
        })

    } catch (error) {
        console.log("Erro coming while sign up : ", error);
        return res.status(501).json({
            success: false,
            message: "error has occured"
        })
    }
}

