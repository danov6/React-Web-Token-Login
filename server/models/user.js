let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');
let uniqueValidator = require('mongoose-unique-validator');
let validator = require('validator');

// -------------
// Define Schema
// -------------
let userSchema = new Schema({
    // ----------------------------------
    // ---------- User Profile ----------
    // ----------------------------------
    local: {
        email: {
            type: String,
            required: [true, "Email cannot be blank"],
            unique: true,
            minlength: [3, 'Email is too short'],
            maxlength: [50, 'Email is too long'],
            validate: [{validator: value => validator.isEmail(value), msg: 'Invalid email'}]
        },
        password: {
            type: String,
            required: [true, "Password cannot be blank"],
            minlength: [8, 'Password is too short']
        }
    },
    first_name: {
        type: String,
        minlength: [1, 'First name is too short'],
        maxlength: [50, 'First name is too long'],
        required: [true, "First name cannot be blank"]
    },
    last_name: {
        type: String,
        minlength: [1, 'Last name is too short'],
        maxlength: [50, 'Last name is too long'],
        required: [true, "Last name cannot be blank"]
    },
    display_name: {
        type: String,
        minlength: [1, 'Display name is too short'],
        maxlength: [50, 'Display name is too long'],
        required: [true, "Display name cannot be blank"]
    },
    profile_img_url: {
        type: String
    },
    // ----------------------------------
    // ------------- Account ------------
    // ----------------------------------
    account_type: {
        type: String,
        default: 'external'
    },
    account_activated: {
        type: Date
    },
    role: {
        type: String,
        default: "user"
    },
    permissions: {
        type: [String],
        default: []
    },
    // ----------------------------------
    // -------------- META --------------
    // ----------------------------------
    last_login: {
        type: Date,
        default: new Date()
    },
    // ----------------------------------
    // -------------- MISC --------------
    // ----------------------------------
    tokens: {
        reset_password_token: {type: String},
        reset_password_expires: {type: Date},
        account_activation_token: {type: String}
    }





}, {timestamps: true});

// -------------
// Config Schema
// -------------

// Generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// Checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// Plugin for pretty uniqueness error message
userSchema.plugin(uniqueValidator);

// -------------
// Return Schema
// -------------
mongoose.model('User', userSchema);