const bcryptjs = require('bcryptjs')
const User = require('../models/user.model.js')
const test = (req, res) => {
    res.json({
        message: 'API is working',
    })
}

const updateUser = async (req, res, next) => {
    try {

        if (req.user.id !== req.params.userId) {
            return res.status(400).json({
                success: false,
                message: 'You are not allowed to update this user'
            })
        }
        const updates = {};
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be atleast 6 characters',
                })
            }
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
            updates.password = req.body.password
        }
        if (req.body.username) {
            if (req.body.username.length < 7 || req.body.username.length > 20)
                return res.status(400).json({
                    success: false,
                    message: 'Username must be between 7 and 20 characters'
                })
            if (req.body.username.includes(' '))
                return res.status(400).json({
                    success: false,
                    message: 'Username cannot have spaces'
                })
            if (req.body.username !== req.body.username.toLowerCase())
                return res.status(400).json({
                    success: false,
                    message: 'Username must be lowercase'
                })
            if (! /^[a-zA-Z0-9]+$/.test(req.body.username)) {
                return res.status(400).json({
                    success: false,
                    message: 'Username can only have letters and numbers',
                });
            }
            updates.username = req.body.username;
        }
        if (req.body.profilePicture)
            updates.profilePicture = req.body.profilePicture
        if (req.body.email)
            updates.email = req.body.email

        const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
            $set: updates
        }, { new: true })
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        if (!req.user.isAdmin && req.user.id !== req.params.userId) {
            return res.status(400).json({
                success: false,
                message: 'You are not allowed to delete this user'
            })
        }
        await User.findByIdAndDelete(req.params.userId);
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const signout = (req, res) => {
    try {
        res.clearCookie('access_token').status(200).json('User has been signed out');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getUsers = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(400).json({
            success: false,
            message: 'You are not allowed to see all users'
        })
    }
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;
        const users = await User.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit)

        const usersWithoutPassword = users.map((user) => {
            const { password, ...rest } = user._doc;
            return rest;
        })

        const totalUsers = await User.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo }
        })
        return res.status(200).json({
            users: usersWithoutPassword,
            totalUsers,
            lastMonthUsers
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { test, updateUser, deleteUser, signout, getUsers, getUser }