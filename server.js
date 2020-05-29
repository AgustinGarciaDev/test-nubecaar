const express = require('express')
const cors = require('cors')
require('dotenv').config()
const router = require('./router')
const socket = require('socket.io')
const path = require('path')
const nodemailer = require('nodemailer')

// Database connection
require('./config/dbConnection')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api', router)

var transport = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: { pass: process.env.MAIL_PASS,
    user: process.env.MAIL_USER}
})

var mailOptions = {     
    from: 'Test Nube CAAR <nocontestar@reply.com>',
    to: 'biaus.fh@gmail.com',
    subject: 'Conexión establecida en TEST NUBECAAR',
    text: "",
    html: "" 
}

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(pathjoin(__dirname+"/client/build/index.html"))
    })
}

const port = process.env.PORT || 4000
const host = process.env.HOST || '0.0.0.0'
const server = app.listen(port, host, () => console.log(`Server listening on port ${port}`))

const io = socket(server)
io.on('connection', socket => {
    transport.sendMail(mailOptions, () => console.log(`Conexión de ${socket.id} el ${new Date().toLocaleString()}`))
    socket.on('reloadPlease', () => {
        socket.broadcast.emit("reloadOrder")
    })
})