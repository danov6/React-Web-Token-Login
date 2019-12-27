import React, {Component} from "react";
import {Helmet} from 'react-helmet';
import email_validator from "email-validator";
import Particles from 'react-particles-js';
import {Prompt} from './Prompt';
/* We want to import our 'AuthHelperMethods' component in order to send a login request */
import AuthHelperMethods from '../AuthHelperMethods';
import {Link} from 'react-router-dom';
import '../../css/login.css';
import axios from "axios";

class Password extends Component {
    Auth = new AuthHelperMethods();

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            prompt: "",
            promptColor: "",
            logoDeg: 0,
            allowSubmit: true
        };
        this.displayPrompt = this.displayPrompt.bind(this);
    }

    // Fired off every time the user enters something into the input fields
    _handleChange = (e) => {
        this.setState(
            {
                [e.target.name]: e.target.value,
                logoDeg: this.state.logoDeg + 15
            }
        );
    };

    handleFormSubmit = (e) => {
        e.preventDefault();
        this.setState({
            allowSubmit: false
        });
        this.displayPrompt("");
        const data = {
            email: this.state.email
        };
        if (!email_validator.validate(data.email)) {
            this.displayPrompt("Email is not valid");
        } else {
            // All validations passed, send POST request
            this.ajaxPOST(data);
        }
    };

    ajaxPOST = (data) => {
        axios.post("/forgot_pw", data).then((response) => {
            if (response.data && response.data.error) {
                // Display error message
                this.displayPrompt(response.data.error);
                return;
            }
            // Display check for password reset email
            this.displayPrompt("A password reset email has been sent to " + this.state.email + " - Please follow the instructions in the email to reset your password", "green", true);
        })
    };

    displayPrompt = (prompt, color, disableSubmit) => {
        this.setState({
            prompt: prompt,
            promptColor: color || "red",
            allowSubmit: !disableSubmit
        });
    };

    componentWillMount() {
        // Redirect someone who is already logged in to the protected route
        if (this.Auth.loggedIn()) this.props.history.replace('/');
    };

    render() {
        return (
            <React.Fragment>
                <Helmet>
                    <title>Password Reset</title>
                </Helmet>
                <div className="login-body-wrapper">
                    <Particles/>
                    <div className="login-wrapper">
                        <div className="login-logo-wrapper">
                            <p><span>Password Reset</span></p>
                        </div>
                        <form className="box-form">
                            <input
                                className="form-item"
                                placeholder="Email"
                                name="email"
                                type="text"
                                onChange={this._handleChange}
                            />
                            <button className="form-submit" disabled={!this.state.allowSubmit}
                                    onClick={this.handleFormSubmit}>Request Password Reset
                            </button>
                        </form>
                        {this.state.prompt.length > 0 &&
                        <Prompt message={this.state.prompt} color={this.state.promptColor}/>}
                        <Link className="link" to="/login">Already have an account? <span
                            className="link-signup">Log In</span></Link>
                            <br/>
                        <Link className="link" to="/signup">Don't have an account? <span>Signup</span></Link>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
export default Password;