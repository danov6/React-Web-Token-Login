const express = require('express');
const port = 3001;
const path = require('path');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const compression = require('compression');
const secret = "JWT-SECRET";
const cors = require('cors');
require('colors');

// ---------------------------------------------------------------
// --------------------------------------------------------- HTTPS
// ---------------------------------------------------------------
const fs = require('fs');
const http = require('http');
const https = require('https');
let options = {};

// ---------------------------------------------------------------
// ----------------------------------------------------------- DEV
// ---------------------------------------------------------------
// if (process.env.PROD_SV === "1") {
//     // Use production certs
//     options = {
//         cert: fs.readFileSync("/etc/letsencrypt/live/usidomino.com/fullchain.pem"),
//         key: fs.readFileSync("/etc/letsencrypt/live/usidomino.com/privkey.pem"),
//         ca: fs.readFileSync("/etc/letsencrypt/live/usidomino.com/chain.pem")
//     };
// }
// ---------------------------------------------------------------
// --------------------------------------------------------- Setup
// ---------------------------------------------------------------
let app = express();
app.use(cors());
app.use(bodyParser.json({
    limit: '100mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));

var REMOVE = false;
if (REMOVE) {
    console.log(__dirname);
    app.use(express.static(path.join(__dirname, '/client/build')));
} else {
    app.use(express.static(path.join(__dirname, '/client')));
}

app.use('/api', expressJwt({
    secret: secret
}));
app.use(compression({
    level: 9,
    memLevel: 9
}));

// ---------------------------------------------------------------
// ------------------------------------------------------ Database
// ---------------------------------------------------------------
require('./config/mongoose');

// ---------------------------------------------------------------
// --------------------------------------------------- Login / Reg
// ---------------------------------------------------------------
let auth = require('./config/auth')(jwt, secret);

// ---------------------------------------------------------------
// -------------------------------------------------------- Routes
// ---------------------------------------------------------------
require('./config/routes')(app, auth, path);

// ---------------------------------------------------------------
// -------------------------------------------------------- Listen
// ---------------------------------------------------------------
let server;
if ("0" === "1") {
    server = https.createServer(options, app).listen(port, function () {
        console.log("[ server ] -----------------------------------------------------------".cyan);
        console.log(`[ server ] ------------ It's over port: ${port}!!! ( https ) ------------`.cyan);
        console.log("[ server ] -----------------------------------------------------------".cyan);
    });
} else {
    server = http.createServer(app).listen(port, function () {
        console.log("[ server ] -----------------------------------------------------------".cyan);
        console.log(`[ server ] ------------ It's over port: ${port}!!! ( http ) -------------`.cyan);
        console.log("[ server ] -----------------------------------------------------------".cyan);
    });
}

// ---------------------------------------------------------------
// ------------------------------------------------------- Sockets
// ---------------------------------------------------------------
// Instantiate Socket.io handshake have it listen on the Express server
// let io = require('socket.io').listen(server);
// let skt = require('./server/controllers/sockets/socket_init');
// skt.init_sockets(io);

// Share io variable to other files
// --------------------------------
//let search_h = require('./server/helpers/search_helper');
//search_h.set_io(io);