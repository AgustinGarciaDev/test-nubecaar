const User = require('../models/User')
const bcrypt = require('bcryptjs')

const userController = {
    listUsers: async (req, res, next) => {
        // Try to get users info and send it to the client
        var error; var users;
        try {
            users = await User.find()
        } catch {
            error = 'Ocurrió un error.  Reinténtelo!'
        }
        success = error ? false : true
        res.json({success, users, error})
    },

    userById: async (req, res, next) => {
        // Returns a specific user information
        const {id} = req.params
        var error; var user;
        try {
            user = await User.findOne({_id: id})
        } catch {
            error = 'Ocurrió un error.  Reinténtelo!'
        }
        success = error ? false : true
        res.json({success, user, error})
    },

    newUser: async (req, res, next) => {
        // Creates new User
        const {name, username, password, email} = req.body
        var error; var createdUser;
        // Verify if any field is empty
        if ([name, username, password, email].some(field => field === '')) {
            error = 'Todos los campos son obligatorios.  Por favor, complételos.'
        }
        if (!error) {
            // Password hash
            let newPwd = bcrypt.hashSync(password, 10)
            // Create new user, try to save it into BD and response client
            let userToCreate = new User({name, username, password: newPwd, email})
            try {
                createdUser = await userToCreate.save()
            } catch {
                error = 'Ocurrió un error.  Reinténtelo!'
            }            
        }
        var success = error ? false : true
        res.json({success, error, createdUser})
    },

    modifyUserStatus: async (req, res, next) => {
        // Allows to modify user "active" status and returns updated document
        const {username} = req.body
        var error; var modifiedUser;
        try {
            const currentStatus = await User.findOne({username})
            modifiedUser = await User.findOneAndUpdate({username}, {active: !currentStatus.active}, {new: true})
            } catch(err) {
                error = 'Ha ocurrido un error.  Reinténtelo!'
            }
        const success = !error ? true : false
        res.json({success, error, modifiedUser})
    },

    setFriends: async (req, res, next) => {
        // Receives an array with user's friends and modify "friends" field
        const {username, friends} = req.body
        var error; 
        try {
            const user = await User.findOneAndUpdate({username}, {friends})
            error = !user ? "Ha ocurrido un error. Reinténtelo!" : false
        } catch {
            error = "Ha ocurrido un error. Reinténtelo!"
        }
        const success = !error ? true : false
        res.json({success, error})
    }
}

module.exports = userController