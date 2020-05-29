const mongoose = require('mongoose')

const tripSchema = new mongoose.Schema({
    numero: {type: Number, required: true, unique: true},
    fecha: {type: String, required: true},
    hora: {type: String, required: true},
    tipo: {type: String, default: 'S'},
    nombre: {type: String, required: true},
    telefono: {type: String},
    dOrigen: {type: String, required: true},
    lOrigen: {type: String, required: true},
    dDestino: {type: String},
    lDestino: {type: String},
    paradas: {type: Boolean},
    conRegreso: {type: Boolean},
    tarifa2: {type: Boolean},
    restringido: {type: Boolean},
    observaciones: {type: String},
    emisor: {type: String, required: true},
    receptor: {type: String},
    status: {type: String, default: 'pending'},
    visible: {type: Array, default: []}
})

const Trip = new mongoose.model('trip', tripSchema)

module.exports = Trip