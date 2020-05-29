const Trip = require('../models/Trip')
const User = require('../models/User')

const tripController = {
    listTripsWithFilter: async (req, res, next) => {
        // Returns all trips with a specific status (with a diff result depending on who's asking for it)
        const {username, status} = req.params
        var trips;
        switch (status) {
            case 'pending':
                // Returns pending trips if the one who requests info is a friend (or friends = []) or the publisher
                trips = await Trip.find({status, $or:[{visible: []}, {visible: {$in: [username]}}, {emisor: username}]})
                break
            case 'taken':
                trips = await Trip.find({status, $or:[{emisor: username}, {receptor: username}]})
                break
            case 'deleted':
                trips = await Trip.find({status, emisor: username})
                break
            default:
                trips = null
                break
        }
        const error = trips ? false : true
        const success = error ? false : true
        res.json({success, error, trips})
    },

    newTrip: async (req, res, next) => {
        const {fecha, hora, tipo, nombre, telefono, dOrigen, lOrigen, dDestino, lDestino,
        paradas, conRegreso, tarifa2, restringido, observaciones, emisor} = req.body
        // Verify if mandatory fields are not empty or missing
        let fields = ['fecha', 'hora', 'tipo', 'nombre', 'dOrigen', 'lOrigen', 'restringido', 'emisor']
        var error; var savedTrip; var visible;
        for (field of fields) {
            error = req.body[field] === '' ? 'Verifique que ninguno de los campos obligatorios esté vacío.' : error
        }
        if (error) {
            return res.json({success: false, error})
        }
        // Generate trip's number
        const trips = await Trip.find()
        var numero = trips.length === 0 ? 1 : parseInt(trips[trips.length-1].numero)+1
        // If "restringido" is true => saves into "visible" the agency's friends
        if (restringido) {
            const agency = await User.findOne({username: emisor})
            visible = agency.friends
        } 
        // Generate new trip and try to save it into BD
        const newTrip = new Trip({numero, fecha, hora, tipo, nombre, telefono, dOrigen, lOrigen, dDestino, lDestino,
        paradas, conRegreso, tarifa2, restringido, observaciones, emisor, visible})
        try {
            savedTrip = await newTrip.save()
            error = savedTrip._id ? false : 'Ha ocurrido un error. Reinténtelo!'
        } catch {
            error = 'Ha ocurrido un error. Reinténtelo!'
        }
        const success = !error ? true : false
        res.json({success, error, savedTrip})
    },

    modifyTrip: async (req, res, next) => {
        // To modify a trip (only available for the agency who originally published it)
        const {numero, fecha, hora, tipo, nombre, telefono, dOrigen, lOrigen, dDestino, lDestino,
        paradas, conRegreso, tarifa2, restringido, observaciones, emisor} = req.body
        var error;
        const tripExists = await Trip.findOne({numero, emisor: req.params.username, status: 'pending'})
        if (!tripExists) {
            return res.json({success: false, error: "Ha ocurrido un error. Reinténtelo!"})
        }
        try {
            // If "restringido" is true => saves into "visible" the agency's friends
            const agency = await User.findOne({username: emisor})
            const visible = restringido ? agency.friends : []
            const modifiedTrip = await Trip.findOneAndUpdate({numero}, {fecha, hora, tipo, nombre, telefono, dOrigen, 
                lOrigen, dDestino, lDestino, paradas, conRegreso, tarifa2, restringido, observaciones, visible})
        } catch {
            error = 'Ha ocurrido un error. Reinténtelo!'
        }
        const success = !error ? true : false
        res.json({success, error})
    },

    takeTrip: async (req, res, next) => {
        // To take a trip from pendings (just available for agencies that ARE NOT the original publisher)
        const {username, numero} = req.params
        var error;
        const tripExists = await Trip.findOne({numero})
        if (!tripExists || tripExists.status !== 'pending' || tripExists.emisor === username) {
            return res.json({success: false, error: 'Ha ocurrido un error. Reinténtelo!'})
        }
        try {
            await Trip.findOneAndUpdate({numero}, {status: 'taken', receptor: username})
        } catch {
            error = 'Ha ocurrido un error. Reinténtelo!'
        }
        const success = !error ? true : false
        res.json({success, error})
    },

    deleteTrip: async (req, res, next) => {
        // To delete a trip from pendings (just available for the agency who originally published it)
        const {username, numero} = req.params
        var error;
        const tripExists = await Trip.findOne({numero, status: 'pending', emisor: username})
        if (!tripExists) {
            return res.json({success: false, error: 'Ha ocurrido un error. Reinténtelo!'})
        }
        try {
            await Trip.findOneAndUpdate({numero, status: 'pending', emisor: username}, {status: 'deleted'})
        } catch {
            error = 'Ha ocurrido un error. Reinténtelo!'
        }
        const success = !error ? true : false
        res.json({success, error})
    },

    returnTrip: async (req, res, next) => {
        // To return a trip (previously taken) and turn its state to "pending"
        const {username, numero} = req.params
        var error;
        const tripExists = await Trip.findOne({numero, status: 'taken', $or:[{emisor: username}, {receptor: username}]})
        if (!tripExists) {
            return res.json({success: false, error: 'Ha ocurrido un error. Reinténtelo!'})
        }
        try {
            await Trip.findOneAndUpdate({numero}, {status: 'pending', receptor: ''})
        } catch {
            error = 'Ha ocurrido un error.  Reinténtelo!'
        }
        const success = !error ? true : false
        res.json({success, error})
    }

}

module.exports = tripController