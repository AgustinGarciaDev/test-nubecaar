const User = require('../models/User')
const bcrypt = require('bcryptjs')

const authController = {
    loginUser: async (req, res, next) => {
        // POST => /api/auth {username, password}
        const {username, password} = req.body
        // Verify if username and/or password are not empty
        if (username === '' || password === '') {
            return res.json({success: false, error: 'Ambos campos son obligatorios.  Complételos!'})
        }
        // Verify if username exists
        const userExists = await User.findOne({username})
        var error = !userExists && 'Usuario y/o contraseña inválidos.  Reinténtelo!'
        if (!error) {
            // Verify if password matches
            const passMatches = bcrypt.compareSync(password, userExists.password)
            error = !passMatches && 'Usuario y/o contraseña inválidos.  Reinténtelo!'
            // Verify if user is Active
            if (!error) {
                error = !userExists.active && `El usuario ${username} ha sido SUSPENDIDO.`
            }
        }
        const success = !error ? true : false
        const loggedUser = !error ? userExists : false
        res.json({success, error, loggedUser})
    },

    verifyIsActive: async (req, res, next) => {
        // Middleware that verifies if the user who is requesting anything is active
        const {username} = req.params
        const userIsActive = await User.findOne({username, active: true})
        if (userIsActive) { 
            return next() }
        res.json({success: false, error: `El usuario ${username} ha sido SUSPENDIDO o no existe.`})
    }
}

module.exports = authController