let fs = require('fs');
let models_path = __dirname + '/../models';
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// -------------------------------------------
// Toggle between production and dev databases
// -------------------------------------------
let uri = "mongodb+srv://glvaldez:Giordano1!@cluster0-u7rzh.mongodb.net/test?retryWrites=true&w=majority";

// -----------------------------------------
// Connect to MongoDB Cloud Atlas / Local DB
// -----------------------------------------
if ("0" === "1") {
    // Connect to MongoDB Atlas Cloud
    mongoose.connect(uri, {
        useCreateIndex: true,
        useNewUrlParser: true
    }).then(function () {
        console.log("[ mongoose ] Successfully connected to mongoose ( MongoDB Atlas )".green);
    }, function (err) {
        console.log("[ mongoose ] Error connecting to MongoDB Atlas!".red);
        console.log(err);
    });
} else {
    // Connect to local instance
    mongoose.connect("mongodb://127.0.0.1:27017/authlogin", {
        useCreateIndex: true,
        useNewUrlParser: true
    }).then(function () {
        console.log("[ mongoose ] Successfully connected to mongoose ( localhost - auth login )".green);
    }, function (err) {
        console.log("[ mongoose ] Error connecting to local MongoDB instance!".red);
        console.log(err);
    });
}

// ---------------------------------------------------------
// Read all of the files in the models_path and for each one
// ---------------------------------------------------------
fs.readdirSync(models_path).forEach(function (file) {
    if (file.indexOf('.js') > 0) {
        require(models_path + '/' + file);
    }
});