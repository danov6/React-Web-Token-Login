const prettyjson = require('prettyjson');
const AWS = require('../config/aws');
const from_email = "dev@giovaldez.com";
const config_set = "gio_media_config_set";
const server_ip = "https://localhost:3001";

module.exports = (function () {
    let aws_ses_h = {};

    aws_ses_h.send_account_activation_email = function (user, token, cb) {
        console.log("[ aws_ses_h ] Sending account activation email to: ".yellow + user.local.email);
        const ses = new AWS.SES({apiVersion: "2010-12-01"});
        const template_data = {
            name: user.first_name,
            url: server_ip + '/confirm_email?token=' + token
        };
        const to_email = user.local.email;
        const params = {
            "Source": from_email,
            "Template": "confirm_email",
            "ConfigurationSetName": config_set,
            "Destination": {"ToAddresses": [to_email]},
            "TemplateData": JSON.stringify(template_data)
        };
        ses.sendTemplatedEmail(params, (err, data) => {
            if (err) {
                console.log("[ aws_ses_h ] ERROR".red, err);
                cb(false);
            } else {
                console.log("[ aws_ses_h ] Templated email successfully submitted to SES".green);
                console.log(prettyjson.render(data));
                cb(true);
            }
        });
    };

    aws_ses_h.send_forgot_password_email = function (user, token, cb) {
        console.log("[ aws_ses_h ] Sending forgot password email to: ".yellow + user.local.email);
        const ses = new AWS.SES({apiVersion: "2010-12-01"});
        const template_data = {
            name: user.first_name,
            url: server_ip + '/reset_pw_render?token=' + token
        };
        const to_email = user.local.email;
        const params = {
            "Source": from_email,
            "Template": "forgot_password",
            "ConfigurationSetName": config_set,
            "Destination": {"ToAddresses": [to_email]},
            "TemplateData": JSON.stringify(template_data)
        };
        ses.sendTemplatedEmail(params, (err, data) => {
            if (err) {
                console.log("[ aws_ses_h ] ERROR".red, err);
                cb(false);
            } else {
                console.log("[ aws_ses_h ] Templated email successfully submitted to SES".green);
                console.log(prettyjson.render(data));
                cb(true);
            }
        });
    };

    aws_ses_h.send_password_reset_success_email = function (email, name, cb) {
        console.log("[ aws_ses_h ] Sending password reset success email to: ".yellow + email);
        const ses = new AWS.SES({apiVersion: "2010-12-01"});
        const template_data = {
            name: name
        };
        const params = {
            "Source": from_email,
            "Template": "reset_password_success_email",
            "ConfigurationSetName": config_set,
            "Destination": {"ToAddresses": [email]},
            "TemplateData": JSON.stringify(template_data)
        };
        ses.sendTemplatedEmail(params, (err, data) => {
            if (err) {
                console.log("[ aws_ses_h ] ERROR".red, err);
                cb(false);
            } else {
                console.log("[ aws_ses_h ] Templated email successfully submitted to SES".green);
                console.log(prettyjson.render(data));
                cb(true);
            }
        });
    };

    return aws_ses_h;
})();