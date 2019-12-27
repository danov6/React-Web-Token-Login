import React, {Component} from "react";
import axios from "axios";
import {Helmet} from "react-helmet";
import email_validator from "email-validator";
import Particles from 'react-particles-js';

/* We want to import our 'AuthHelperMethods' component in order to send a login request */
import AuthHelperMethods from '../AuthHelperMethods';
import {Link} from 'react-router-dom';
import '../../css/login.css';
import {Prompt} from "./Prompt";

export default class Signup extends Component {
    Auth = new AuthHelperMethods();

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            first_name: "",
            last_name: "",
            password: "",
            confirm_password: "",
            prompt: "",
            promptColor: "red",
            logoDeg: 0,
            allowSubmit: true
        };
    };

    // Fired off every time the user enters something into the input fields
    _handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
            logoDeg: this.state.logoDeg + 15
        });
    };

    handleFormSubmit = (e) => {
        e.preventDefault();
        this.setState({
            allowSubmit: false
        });
        this.displayPrompt("");
        const data = {
            email: this.state.email,
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            password: this.state.password
        };

        // Perform validations
        if (!email_validator.validate(data.email)) {
            this.displayPrompt("Email is not valid");
        } else if (!data.first_name) {
            this.displayPrompt("First name cannot be blank");
        } else if (!data.last_name) {
            this.displayPrompt("Last name cannot be blank");
        } else if (!data.password) {
            this.displayPrompt("Password cannot be blank");
        } else if (data.password.length < 8) {
            this.displayPrompt("Password must be at least 8 characters");
        } else if (data.password !== this.state.confirm_password) {
            this.displayPrompt("Passwords do not match");
        } else {

            // All validations passed, send POST request
            this.ajaxPOST(data);
        }
    };

    ajaxPOST = (data) => {
        axios.post("/signup", data).then((response) => {
            if (response.data && response.data.error) {
                // Display error message
                this.displayPrompt(response.data.error, null, true);
                return;
            }
            // Display confirm email message
            this.displayPrompt("An account activation email has been sent to " + this.state.email + " - Please follow the instructions on the email to activate your account. Once your email is confirmed, you may log in using the credentials provided during signup", "green", true);
        })
    };

    displayPrompt = (prompt, color, disableSubmit) => {
        this.setState({
            prompt: prompt,
            promptColor: color || "red",
            allowSubmit: !disableSubmit
        });
    };

    componentDidMount() {
        // Redirect someone who is already logged in to the protected route
        if (this.Auth.loggedIn()) this.props.history.push('/dashboard');
    };

    render() {
        return (
            <React.Fragment>
                <Helmet>
                    <title>Sign Up</title>
                </Helmet>
                <div className="login-body-wrapper">
                    <Particles/>
                    <div className="login-wrapper">
                        <div className="login-logo-wrapper">
                            <p><span>Sign Up</span></p>
                        </div>
                        <form className="box-form">
                            <input
                                className="form-item"
                                placeholder="Email"
                                name="email"
                                type="text"
                                onChange={this._handleChange}
                            />
                            <input
                                className="form-item"
                                placeholder="First name"
                                name="first_name"
                                type="text"
                                onChange={this._handleChange}
                            />
                            <input
                                className="form-item"
                                placeholder="Last name"
                                name="last_name"
                                type="text"
                                onChange={this._handleChange}
                            />
                            <input
                                className="form-item"
                                placeholder="Password (min. 8 characters)"
                                name="password"
                                type="password"
                                onChange={this._handleChange}
                            />
                            <input
                                className="form-item"
                                placeholder="Confirm Password"
                                name="confirm_password"
                                type="password"
                                onChange={this._handleChange}
                            />
                            <button className="form-submit" disabled={!this.state.allowSubmit}
                                    onClick={this.handleFormSubmit}>Create Account
                            </button>
                        </form>
                        {this.state.prompt.length > 0 &&
                        <Prompt message={this.state.prompt} color={this.state.promptColor}/>}
                        <Link className="link" to="/login">Already have an account? <span
                            className="link-signup">Log In</span></Link>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}