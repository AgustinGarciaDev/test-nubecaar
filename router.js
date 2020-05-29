const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const authController = require('./controllers/authController')
const tripController = require('./controllers/tripController')

router.route('/users')
// Create new user
.post(userController.newUser)
// Get all registered users
.get(userController.listUsers)
// Modify user "active" status
.put(userController.modifyUserStatus)

router.route('/users/:id')
// Get a specific user information
.get(userController.userById)

router.route('/users/friends')
// Modify user's friends
.put(userController.setFriends)

// ***************************************************

router.route('/auth')
// Login User
.post(authController.loginUser)

// ***************************************************

router.route('/trips/:username')
// Create new trip (previously verifies that user is active)
.post(authController.verifyIsActive, tripController.newTrip)
// Modify a trip (just the user who originally published it)
.put(authController.verifyIsActive, tripController.modifyTrip)

router.route('/trips/:username/:status')
// List all trips with a particular status (pending, taken or deleted)
.get(authController.verifyIsActive, tripController.listTripsWithFilter)

router.route('/trips/:username/trip/:numero')
// Take a trip from pendings
.get(authController.verifyIsActive, tripController.takeTrip)
// Delete a trip from pendings
.delete(authController.verifyIsActive, tripController.deleteTrip)
// Return a trip from taken to pending (just agency who published or took it)
.put(authController.verifyIsActive, tripController.returnTrip)


module.exports = router