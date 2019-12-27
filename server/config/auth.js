let mongoose = require('mongoose');
let User = mongoose.model('User');
let path = require('path');
let email_h = require('../helpers/email_helper');
let email_validator = require("email-validator");

let god_mode_email = "development@giovaldez.com"

// ----------------------------------------------------------------------
// --------------------------- Public Methods ---------------------------
// ----------------------------------------------------------------------
module.exports = function (jwt, secret) {
    let auth = {};
    auth.signup = function (req, res) {
        if (req.body.email && email_validator.validate(req.body.email)) {
            User.findOne({'local.email': req.body.email}).exec().then(function (usr) {
                if (usr) {
                    res.json({error: [req.body.email + ' is already registered, please log in instead']});
                } else {
                    const emailArr = req.body.email.split("@");
                    if (emailArr.length === 2) {
                        // Create new user
                        let newUser = new User();
                        newUser.local.email = req.body.email;
                        newUser.local.password = newUser.generateHash(req.body.password);
                        newUser.first_name = req.body.first_name;
                        newUser.last_name = req.body.last_name;
                        newUser.display_name = emailArr[0];
                        newUser.account_type = "internal";
                        if (req.body.email === god_mode_email) {
                            newUser.role = "admin";
                            newUser.permissions = ["all"];
                        }
                        newUser.save().then(function () {
                            console.log("[ auth ] NEW USER CREATED: ".green + newUser.local.email);
                            // Send account activation email
                            email_h['sendActivationEmail'](newUser.local.email, function (success) {
                                if (success) {
                                    // All is well, notify user to confirm email
                                    res.json({email: req.body.email});
                                } else {
                                    res.json({error: ['Failed to send email']});
                                }
                            });
                        }, function (err) {
                            console.log("[ auth ] Error saving new user".red, err);
                            // Build model validation error array
                            let errObj = err.toJSON().errors;
                            let errArr = [];
                            for (let e in errObj) {
                                // Skip loop if the property is from prototype
                                if (!errObj.hasOwnProperty(e)) continue;
                                errArr.push(errObj[e].message);
                            }
                            // Respond with validation errors
                            res.json({error: errArr});
                        });
                    } else {
                        res.json({error: ['An @giovaldez.com email address is required']});
                    }
                }
            }, function (err) {
                console.log("[ auth ] Error finding one user".red, err);
                res.json({error: ['Error fetching user']});
            });
        } else {
            res.json({error: ['Please submit a valid email address']});
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////                                                                    ////
    ////                                LOG IN                              ////
    ////                                                                    ////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    auth.login = function (req, res) {
        if (req.body.email && email_validator.validate(req.body.email)) {
            User.findOne({'local.email': req.body.email}).exec().then(function (usr) {
                if (!usr || !usr.validPassword(req.body.password)) {
                    res.json({error: ['Invalid email or password']});
                } else if (!usr.account_activated) {
                    // User has not confirmed email
                    res.json({error: ['Email not confirmed'], color: "yellow", resend_conf: true});
                } else {
                    // All is well, return auth token
                    let user = {_id: usr._id};
                    let token = jwt.sign(user, secret, {expiresIn: '7d'}); // Expires in 1 week
                    res.json({token: token});
                }
            }, function (err) {
                console.log("[ auth ] Error finding one user".red, err);
                res.json({error: ['Error fetching user']});
            });
        } else {
            res.json({error: ['Please submit a valid email address']});
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////                                                                    ////
    ////                  Resend Account Activation Email                   ////
    ////                                                                    ////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    auth.resend_account_activation_email = function (req, res) {
        if (req.body.email && email_validator.validate(req.body.email)) {
            User.findOne({'local.email': req.body.email}).exec().then(function (usr) {
                if (!usr) {
                    res.json({error: [req.body.email + ' is not a registered email']});
                } else if (usr.account_activated) {
                    res.json({error: [req.body.email + ' is already activated']});
                } else {
                    // User found and account is not yet activated, resend email
                    email_h['sendActivationEmail'](req.body.email, function(success) {
                        if (success) {
                            res.json({email: req.body.email});
                        } else {
                            res.json({error: ['Failed to send email']});
                        }
                    });
                }
            }, function (err) {
                console.log("[ auth ] Error finding one user".red, err);
                res.json({error: ['Error fetching user']});
            });
        } else {
            res.json({error: ['Invalid Email']});
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////                                                                    ////
    ////                           Email Confirmed                          ////
    ////                                                                    ////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    auth.confirm_email = function (req, res) {
        const token = req.query.token;
        console.log("[ auth ] confirm_email using token:", token);
        // ---------------------------------------
        // TESTING STATIC PAGE RENDER ------------
        // ---------------------------------------
        if (token && token === "test") {
            return res.sendFile(path.resolve('./server/templates/email_confirmed.html'));
        }
        // ---------------------------------------
        // ---------------------------------------
        // ---------------------------------------
        if (token) {
            User.findOne({'tokens.account_activation_token': token}).exec().then(function (user) {
                if (user) {
                    user.tokens.account_activation_token = undefined;
                    user.account_activated = Date.now();
                    user.save(function (err) {
                        if (err) {
                            return res.status(422).send({
                                message: err
                            });
                        } else {
                            return res.sendFile(path.resolve('./server/templates/email_confirmed.html'));
                        }
                    });
                } else {
                    return res.status(422).send({
                        message: 'Token is invalid, no user found'
                    });
                }
            }, function (err) {
                console.log("[ auth ] Error finding one user using login token".red, err);
                return res.status(422).send({
                    message: 'Account activation token is invalid or has expired'
                });
            });
        } else {
            return res.status(422).send({
                message: 'No token found'
            });
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////                                                                    ////
    ////                          FORGOT PASSWORD                           ////
    ////                                                                    ////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    auth.forgot_pw = function (req, res) {
        if (req.body.email && email_validator.validate(req.body.email)) {
            User.findOne({'local.email': req.body.email}).exec().then(function (usr) {
                if (!usr) {
                    res.json({error: ['The email entered is not registered']});
                } else {
                    // User found, send password reset email
                    email_h['sendPasswordResetEmail'](req.body.email, function(success) {
                        if (success) {
                            res.json({email: req.body.email});
                        } else {
                            res.json({error: ['Failed to send email']});
                        }
                    });
                }
            }, function (err) {
                console.log("[ auth ] Error finding one user".red, err);
                res.json({error: ['Error fetching user']});
            });
        } else {
            res.json({error: ['Please submit a valid email address']});
        }
    };
    auth.reset_pw_render = function (req, res) {
        // Render the page to enter new password
        return res.sendFile(path.resolve('./server/templates/reset_password.html'));
    };
    auth.reset_pw_submit = function (req, res) {
        console.log(req.body);
        const newPassword = req.body.newPassword;
        const verifyPassword = req.body.verifyPassword;
        const token = req.body.token;
        if (newPassword && newPassword.length > 7 && verifyPassword && newPassword === verifyPassword && token) {
            // We have all the info we need to attempt a password reset
            console.log("[ auth ] User is resetting password with token: ".yellow + req.body.token);
            User.findOne({
                'tokens.reset_password_token': req.body.token,
                'tokens.reset_password_expires': {
                    $gt: Date.now()
                }
            }).exec().then(function (user) {
                if (user) {
                    if (req.body.newPassword === req.body.verifyPassword && req.body.newPassword.length >= 8) {
                        user.local.password = user.generateHash(req.body.newPassword);
                        user.tokens.reset_password_token = undefined;
                        user.tokens.reset_password_expires = undefined;
                        user.save().then(function () {
                            // Send password reset success email
                            email_h['sendPasswordResetSuccessEmail'](user.local.email, user.first_name, function(success) {
                                if (success) {
                                    return res.json({email: req.body.email});
                                } else {
                                    return res.status(400).send({
                                        message: 'Failed to send confirmation email.'
                                    });
                                }
                            });
                        }, function (err) {
                            console.log("[ auth ] Error saving one user".red, err);
                            return res.status(400).send({
                                message: 'Password reset failed, error saving user.'
                            });
                        });
                    } else {
                        return res.status(422).send({
                            message: 'Passwords do not match or is too short'
                        });
                    }
                } else {
                    console.log("[ auth ] Reset password token is invalid or user not found: ".yellow);
                    return res.status(400).send({
                        message: 'Password reset token is invalid or has expired.'
                    });
                }
            }, function (err) {
                console.log("[ auth ] Error finding one user".red, err);
                return res.status(400).send({
                    message: 'Password reset token is invalid or has expired.'
                });
            });
        } else {
            return res.status(400).send({
                message: 'Missing required data to proceed'
            });
        }
    };


    return auth;
};

// -------------------------
// --------- TEST ----------
// -------------------------
// auth.test_email = function (req, res) {
//     const data = {};
//     aws_ses_h.send(data, function () {
//         res.json({success: true});
//     });
// };
// -------------------------
// -------------------------
// -------------------------

// auth.reset_db = function(req, res) {
//     if (req.body.secret && req.body.secret === "whoismrrobot") {
//         User.remove({}, function () {
//             console.log("[ auth ] Successfully deleted all users");
//             auth.init();
//             res.json({message: "success!"})
//         });
//
//     } else {
//        res.json({error: "nope"})
//     }
// };

// Create admin account if it doesn't exist
//  auth.init = function () {
//     User.findOne({'local.email': "afeng@upsellit.com"}).exec().then(function (usr) {
//         if (!usr) {
//             console.log("[ auth ] Admin account not found, creating admin accounts...");

//             // Gio
//             let newUser = new User();
//             newUser.local.email = "danov6@aol.com";
//             newUser.local.password = newUser.generateHash("Giordano1!");
//             newUser.display_name = "Gio";
//             newUser.full_name = "Gio Valdez";
//             newUser.profile_img_url = "https://i.imgur.com/sYTIkQ8.jpg";
//             newUser.account_type = "internal";
//             newUser.role = ["admin"];
//             newUser.permissions = "god-mode";
//             newUser.save().then(function () {
//                 console.log("[ auth ] Successfully created new user -> ".green + newUser.display_name);
//             }, function (err) {
//                 console.log("[ auth ] Error saving new user".red, err);
//             });
//
//             setTimeout(function () {
//                 // Casey
//                 let newUser2 = new User();
//                 newUser2.local.email = "cyoun@upsellit.com";
//                 newUser2.local.password = newUser2.generateHash("password123");
//                 newUser2.display_name = "casey";
//                 newUser2.full_name = "Casey Youn";
//                 newUser2.profile_img_url = "https://i.imgur.com/WIh13aV.jpg";
//                 newUser2.account_type = "internal";
//                 newUser2.role = "admin";
//                 newUser2.permissions = ["admin"];
//                 newUser2.department = "Sales";
//                 newUser2.save().then(function () {
//                     console.log("[ auth ] Successfully created new user -> ".green + newUser2.display_name);
//                 }, function (err) {
//                     console.log("[ auth ] Error saving new user".red, err);
//                 });
//             }, 100);
//
//             setTimeout(function () {
//                 // Ashley
//                 let newUser3 = new User();
//                 newUser3.local.email = "aday@upsellit.com";
//                 newUser3.local.password = newUser3.generateHash("password123");
//                 newUser3.display_name = "ashley";
//                 newUser3.full_name = "Ashley Day";
//                 newUser3.profile_img_url = "https://i.imgur.com/QIaXVAo.png";
//                 newUser3.account_type = "internal";
//                 newUser3.role = "admin";
//                 newUser3.permissions = ["admin"];
//                 newUser3.department = "CSM";
//                 newUser3.save().then(function () {
//                     console.log("[ auth ] Successfully created new user -> ".green + newUser3.display_name);
//                 }, function (err) {
//                     console.log("[ auth ] Error saving new user".red, err);
//                 });
//             }, 200);
//
//
//             setTimeout(function () {
//                 // Jeremy
//                 let newUser4 = new User();
//                 newUser4.local.email = "jriley@upsellit.com";
//                 newUser4.local.password = newUser4.generateHash("password123");
//                 newUser4.display_name = "jeremy";
//                 newUser4.full_name = "Jeremy Riley";
//                 newUser4.profile_img_url = "https://i.imgur.com/0pA2arf.png";
//                 newUser4.account_type = "internal";
//                 newUser4.role = "admin";
//                 newUser4.permissions = ["admin"];
//                 newUser4.department = "Design";
//                 newUser4.save().then(function () {
//                     console.log("[ auth ] Successfully created new user -> ".green + newUser4.display_name);
//                 }, function (err) {
//                     console.log("[ auth ] Error saving new user".red, err);
//                 });
//             }, 300);
//
//             setTimeout(function () {
//                 // Semalife
//                 let newUser5 = new User();
//                 newUser5.local.email = "test@test.com";
//                 newUser5.local.password = newUser5.generateHash("password123");
//                 newUser5.display_name = "lws";
//                 newUser5.full_name = "Jar Jar";
//                 newUser5.profile_img_url = "https://i.imgur.com/94lVDlV.jpg";
//                 newUser5.account_type = "external";
//                 newUser5.role = "user";
//                 newUser5.primary_company.name = "Lovely Wholesale";
//                 newUser5.primary_company.sf_id = "0011I00000YOzXDQA1";
//                 newUser5.primary_company.rep = "cyoun@upsellit.com";
//                 newUser5.save().then(function () {
//                     console.log("[ auth ] Successfully created new user -> ".green + newUser5.display_name);
//                 }, function (err) {
//                     console.log("[ auth ] Error saving new user".red, err);
//                 });
//             }, 400);
//
//          }
//     }, function (err) {
//         console.log("[ auth ] Error finding one user".red, err);
//     });
// };


// // -------------------------
// // Resend Confirmation Email
// // -------------------------
// auth.resend_conf_email = function (uid, cb) {
//     User.findOne({_id: uid}).exec().then(function (user) {
//         if (user) {
//             if (!user.account_activated) {
//                 // Send account activation email
//                 console.log("[ auth ] * * * Resend email confirmation requested for email: ".yellow + user.local.email);
//                 sendActivationEmail(user.local.email);
//                 cb(true);
//             } else {
//                 cb(false);
//             }
//         } else {
//             cb(false);
//         }
//     }, function (err) {
//         console.log("[ auth ] Error finding one user by _id".red);
//         console.log(err);
//         cb(false);
//     });
// };
//
// // --------------------------
// // Send email to notify admin
// // --------------------------
// auth.email_admin = function (txt, cb) {
//     let admin_email = "danov6@aol.com";
//     console.log("[ auth ] Sending admin notification email to: ".yellow + admin_email);
//     let data = {
//         to: admin_email,
//         from: email,
//         template: 'admin-notification',
//         subject: 'USI Domino Server Notification (Auto-generated)',
//         context: {
//             msg: txt
//         }
//     };
//     smtpTransport.sendMail(data, function (err) {
//         if (!err) {
//             return cb("[ auth ] Successfully sent admin notification email to: ".green + admin_email);
//         } else {
//             return cb(err);
//         }
//     });
// };


// ----------------------
// Forgot password method
// ----------------------
// auth.fpw = function (req, res) {
//     console.log("[ auth ] Sending password reset email to: ".yellow + req.body.email);
//     async.waterfall([
//         function (done) {
//             User.findOne({
//                 'local.email': req.body.email
//             }, function (err, user) {
//                 if (user) {
//                     done(err, user);
//                 } else {
//                     done('User not found');
//                 }
//             });
//         },
//         function (user, done) {
//             // Create the random token
//             crypto.randomBytes(20, function (err, buffer) {
//                 let token = buffer.toString('hex');
//                 done(err, user, token);
//             });
//         },
//         function (user, token, done) {
//             User.findByIdAndUpdate({_id: user._id}, {
//                 'tokens.reset_password_token': token,
//                 'tokens.reset_password_expires': Date.now() + 86400000
//             }, {upsert: true, new: true}).exec().then(function (new_user) {
//                 done(undefined, token, new_user);
//             }, function (err) {
//                 console.log(err);
//                 done(err, token, {});
//             });
//         },
//         function (token, user, done) {
//             let data = {
//                 to: user.local.email,
//                 from: email,
//                 template: 'forgot-password-email',
//                 subject: 'Password help has arrived!',
//                 context: {
//                     url: 'https://' + server_public_ip + '/auth/reset_password?token=' + token,
//                     // url: 'http://localhost:9000/auth/reset_password?token=' + token,
//                     name: user.display_name
//                 }
//             };
//             smtpTransport.sendMail(data, function (err) {
//                 if (!err) {
//                     return res.json({success: true});
//                 } else {
//                     return done(err);
//                 }
//             });
//         }
//     ], function (err) {
//         console.log(err);
//         return res.json({error: [err]});
//     });
// };
//
// // ------------------------------
// // Render Reset Password Template
// // ------------------------------
// auth.render_reset_password_template = function (req, res,) {
//     return res.sendFile(path.resolve('./server/templates/reset_password.html'));
// };
//

//
// // -----------------------------
// // Send Account Activation Email
// // -----------------------------
// function sendActivationEmail(newUserEmail) {
//     console.log("[ auth ] Sending account activation email to: ".yellow + newUserEmail);
//     async.waterfall([
//         function (done) {
//             User.findOne({
//                 'local.email': newUserEmail
//             }).exec().then(function (user) {
//                 done(undefined, user);
//             }, function (err) {
//                 console.log(err);
//                 done('User not found');
//             });
//         },
//         function (user, done) {
//             // Create the random token
//             crypto.randomBytes(20, function (err, buffer) {
//                 let token = buffer.toString('hex');
//                 done(err, user, token);
//             });
//         },
//         function (user, token, done) {
//             User.findByIdAndUpdate({_id: user._id}, {'tokens.account_activation_token': token}, {
//                 upsert: true,
//                 new: true
//             }).exec().then(function (new_user) {
//                 done(undefined, token, new_user);
//             }, function (err) {
//                 console.log(err);
//                 done(err, token, {});
//             });
//         },
//         function (token, user, done) {
//             let data = {
//                 to: user.local.email,
//                 from: email,
//                 template: 'account-activation-email',
//                 subject: 'Welcome to USI Domino! Please verify your email address',
//                 context: {
//                     url: 'https://' + server_public_ip + '/auth/confirm_email?token=' + token,
//                     name: user.display_name
//                 }
//             };
//             smtpTransport.sendMail(data, function (err) {
//                 if (!err) {
//                     return done("[ auth ] Successfully sent account activation email to: ".green + newUserEmail);
//                 } else {
//                     return done(err);
//                 }
//             });
//         }
//     ], function (err) {
//         console.log(err);
//         return false;
//     });
// }
//
// // -----------------------
// // Account Email Confirmed
// // -----------------------
// auth.email_confirmed = function (req, res) {
//     User.findOne({
//         'tokens.account_activation_token': req.query.token
//     }).exec().then(function (user) {
//         if (user) {
//             user.tokens.account_activation_token = undefined;
//             user["account_activated"] = Date.now();
//             user.save(function (err) {
//                 if (err) {
//                     return res.status(422).send({
//                         message: err
//                     });
//                 } else {
//                     return res.sendFile(path.resolve('./server/templates/email_confirmed.html'));
//                 }
//             });
//         }
//     }, function (err) {
//         console.log("[ auth ] Error finding one user using login token".red, err);
//         return res.status(400).send({
//             message: 'Account activation token is invalid or has expired'
//         });
//     });
// };


// end