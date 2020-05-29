const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: false, unique: true},
    friends: {type: Array, default: []},
    active: {type: Boolean, default: true}
})

const User = new mongoose.model('user', userSchema)

module.exports = User