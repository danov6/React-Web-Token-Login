let mongoose = require('mongoose');
let User = mongoose.model('User');

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Record last user login time and update daily points and login streaks
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
function recordUserLogin(u, callback) {
    // Update last login date
    u.last_login = new Date();
    // Save to db and return user
    u.save(function (err) {
        if (err) console.log("[ users ] Error saving user last login".red, err);
        callback(u);
    });
}

// ---------------------------------------------
// ---------------------------------------------
// Helper function to fetch one user using email
// ---------------------------------------------
// ---------------------------------------------
function find_user_by_email(email, cb) {
    User.findOne({'local.email': email}, {
        'local.password': 0,
        'tokens': 0
    }).exec().then(function (u) {
        if (u) {
            cb(u);
        } else {
            cb({error: ['User does not exist']});
        }
    }, function (err) {
        console.log("[ users ] Error finding one user by email".red, err);
        cb({error: ['Error fetching user from database']});
    });
}

function find_user_by_id(uid, cb) {
    User.findOne({'_id': uid}, {
        'local.password': 0,
        'tokens': 0
    }).exec().then(function (u) {
        if (u) {
            cb(u);
        } else {
            cb({error: ['User does not exist']});
        }
    }, function (err) {
        console.log("[ users ] Error finding one user by _id".red, err);
        cb({error: ['Error fetching user from database']});
    });
}

// --------------
// Public Methods
// --------------
module.exports = (function() {
    let u = {};

    // ---------------
    // Fetch user data
    // ---------------
    u.profile = function (req, res) {
        if (!req.user) {
            res.json({error: ['Not authorized']});
        } else {
            console.log("[ users ] New login :::::::::::::::::::::::::::::::::::::::::::: ".magenta + req.user._id);
            find_user_by_id(req.user._id, function (usr) {
                if (usr.error) {
                    return res.status(422).send(usr);
                } else {
                    // Record login and respond with user data
                    recordUserLogin(usr, function (u) {
                        res.json(u);
                    });
                }
            });
        }
    };







    // ------------------------
    // Record user's last login
    // ------------------------
    u.reset_last_login = function (uid, cb) {
        find_user_by_id(uid, function (usr) {
            if (!usr.error) {
                // Record login
                recordUserLogin(usr, function () {
                    cb();
                });
            }
        });
    };



    // --------------------
    // Fetch internal users
    // --------------------
    u.fetch_internal = function (req, res) {
        if (!req.user) {
            res.json({error: ['Not authorized']});
        } else {
            console.log("[ users ] Fetch internal users: ".magenta + req.user.email);
            find_user_by_email(req.user.email, function (usr) {
                if (usr.error) {
                    res.json(usr);
                } else {
                    // Fetch all other users
                    User.find({'_id': {$ne: usr._id}}, {
                        '_id': 1,
                        'full_name': 1,
                        'profile_img_url': 1,
                        'last_login': 1,
                        'local.email': 1
                    }).exec().then(function (usr_arr) {
                        if (usr_arr && usr_arr.length > 0) {
                            res.json(usr_arr)
                        } else {
                            res.json({error: ['No users found']});
                        }
                    }, function (err) {
                        console.log("[ users ] Error fetching all users".red, err);
                        res.json({error: ['Error fetching users from database']});
                    });
                }
            });
        }
    };
    
    return u;
})();