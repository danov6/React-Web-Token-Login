let users = require('../controllers/users');

// -------------
// Define Routes
// -------------
module.exports = function (app, auth, path) {

    // =======================================================
    // ====================== Auth Routes ====================
    // =======================================================
    app.post('/login', function (req, res) {
        auth.login(req, res);
    });

    app.post('/signup', function (req, res) {
        auth.signup(req, res);
    });

    app.post('/resend_account_activation_email', function (req, res) {
        auth.resend_account_activation_email(req, res);
    });

    app.get('/test', function (req, res) {
        console.log("TEST");
        res.json("test");
    });

    app.get('/confirm_email', function (req, res) {
        auth.confirm_email(req, res);
    });

    app.post('/forgot_pw', function (req, res) {
        auth.forgot_pw(req, res);
    });

    app.get('/reset_pw_render', function (req, res) {
        auth.reset_pw_render(req, res);
    });

    app.post('/reset_pw_submit', function (req, res) {
        auth.reset_pw_submit(req, res);
    });

    // =========================================================================
    // ============================= User Routes ===============================
    // =========================================================================
    app.get('/api/user', function (req, res) {
        users.profile(req, res);
    });

    app.post('/api/user/fetch_internal', function (req, res) {
        users.fetch_internal(req, res);
    });

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // * * * * * * * * * * * * * * *   Web Routes  * * * * * * * * * * * * * * *
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    app.get('*', (req, res) => {
        if ("0" === "1" || "0" === "1") {
            res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
        } else {
            res.sendFile(path.join(__dirname, '../../client/public', 'index.html'));
        }
    });



    // app.get('/', function(req, res) {
    //     console.log("here");
    //     if (process.env.PROD_SV === "1" || process.env.BUILD_TEST === "1") {
    //         res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    //     } else {
    //         res.sendFile(path.resolve('client/public/index.html'));
    //     }
    // });

};