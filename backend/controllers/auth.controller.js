const User = require("../models/user.model.js");
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

// zod

const signup = async (req, res) => {
    console.log("/welcome to signup 2");
    try {
        console.log(req.body.formData);
        const { username, email, password } = req.body.formData;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are needed'
            })
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        await newUser.save();

        return res.status(200).json({
            success: true,
            message: 'Signup succcessful'
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({
                success: false,
                message: "Please enter all the fields"
            })

        const validUser = await User.findOne({ email })
        if (!validUser)
            return res.status(400).json({
                success: false,
                message: 'No such user exists'
            })
        const validPassword = await bcryptjs.compare(password, validUser.password);
        if (!validPassword)
            return res.status(400).json({
                success: false,
                message: 'Invalid Password'
            })

        const token = jwt.sign(
            { id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        const { password: pass, ...rest } = validUser._doc;

        res.status(200).cookie('access_token', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV==="production",
            sameSite: 'Strict'
        }).json(rest)
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const google = async (req, res) => {
    try {
        const { email, name, googlePhotoUrl } = req.body;

        const user = await User.findOne({ email });

        if (user) {
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);

            const { password: pass, ...rest } = user._doc;

            res.status(200).cookie('access_token', token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV==="production",
                sameSite: 'Strict'
            }).json(rest)
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8)
            const hashedPassword = await bcryptjs.hash(generatedPassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(4),
                email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl
            })
            await newUser.save()
            const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET);

            const { password: pass, ...rest } = newUser._doc;

            res.status(200).cookie('access_token', token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV==="production",
                sameSite: 'Strict'
            }).json(rest)
        }



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = { signup, signin, google }