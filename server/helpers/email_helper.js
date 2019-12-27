let mongoose = require('mongoose');
let User = mongoose.model('User');
let crypto = require('crypto');
let async = require('async');
let aws_ses_h = require('./aws_ses_helper');

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// --------------------------- Public Methods ---------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
module.exports = (function () {
    let eh = {};

    // -----------------------------
    // Send Account Activation Email
    // -----------------------------
    eh.sendActivationEmail = function (newUserEmail, cb) {
        console.log("[ email_helper ] ::::::::: Sending account activation email to: ".yellow + newUserEmail);
        async.waterfall([
            function (callback) {
                // Find the user
                User.findOne({'local.email': newUserEmail}).exec().then(function (user) {
                    // Call the next function to generate token
                    callback(null, user);
                }, function (err) {
                    console.log("[ sendActivationEmail ] Error: user not found".red);
                    callback(err);
                });
            },
            function (user, callback) {
                // Create the random token
                crypto.randomBytes(20, function (err, buffer) {
                    if (err) {
                        console.log("[ sendActivationEmail ] Error creating random token".red);
                        callback(err);
                    } else {
                        // Call the next function to save token to user
                        let token = buffer.toString('hex');
                        callback(null, user, token)
                    }
                });
            },
            function (user, token, callback) {
                User.findOneAndUpdate({_id: user._id}, {'tokens.account_activation_token': token}, {
                    upsert: true,
                    new: true
                }).exec().then(function (saved_user) {
                    // Call the next function to send email
                    callback(null, saved_user, token);
                }, function (err) {
                    console.log("[ sendActivationEmail ] Error saving token to user".red);
                    callback(err);
                });
            },
            function (user, token, callback) {
                aws_ses_h.send_account_activation_email(user, token, function (success) {
                    if (success) {
                        callback(null, success);
                    } else {
                        callback("[ sendActivationEmail > waterfall ] Failed to send email");
                    }
                });
            }
        ], function (err, result) {
            if (err) console.log("[ sendActivationEmail ] An error occurred somewhere down the line".red, err);
            cb(result);
        });
    };

    eh.sendPasswordResetEmail = function (email, cb) {
        console.log("[ email_helper ] ::::::::: Sending password reset email to: ".yellow + email);
        async.waterfall([
            function (callback) {
                // Find the user
                User.findOne({'local.email': email}).exec().then(function (user) {
                    // Call the next function to generate token
                    callback(null, user);
                }, function (err) {
                    console.log("[ sendPasswordResetEmail ] Error: user not found".red);
                    callback(err);
                });
            },
            function (user, callback) {
                // Create the random token
                crypto.randomBytes(20, function (err, buffer) {
                    if (err) {
                        console.log("[ sendPasswordResetEmail ] Error creating random token".red);
                        callback(err);
                    } else {
                        // Call the next function to save token to user
                        let token = buffer.toString('hex');
                        callback(null, user, token)
                    }
                });
            },
            function (user, token, callback) {
                User.findOneAndUpdate({_id: user._id}, {
                    'tokens.reset_password_token': token,
                    'tokens.reset_password_expires': Date.now() + 86400000 // 1 day
                }, {
                    upsert: true,
                    new: true
                }).exec().then(function (saved_user) {
                    // Call the next function to send email
                    callback(null, saved_user, token);
                }, function (err) {
                    console.log("[ sendPasswordResetEmail ] Error saving token to user".red);
                    callback(err);
                });
            },
            function (user, token, callback) {
                aws_ses_h.send_forgot_password_email(user, token, function (success) {
                    if (success) {
                        callback(null, success);
                    } else {
                        callback("[ sendPasswordResetEmail > waterfall ] Failed to send email".red);
                    }
                });
            }
        ], function (err, result) {
            if (err) console.log("[ sendPasswordResetEmail ] An error occurred somewhere down the line".red, err);
            cb(result);
        });
    };

    eh.sendPasswordResetSuccessEmail = function (email, name, cb) {
        aws_ses_h.send_password_reset_success_email(email, name, function (success) {
            cb(success);
        });
    };

    return eh;
})();