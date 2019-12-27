import React, { Component } from "react";
import {Helmet} from 'react-helmet';
import email_validator from "email-validator";
import Particles from 'react-particles-js';
import axios from "axios";

// /* We want to import our 'AuthHelperMethods' component in order to send a login request */
import AuthHelperMethods from '../AuthHelperMethods';
import {Link} from 'react-router-dom';
import '../../css/login.css';
import {Prompt} from "./Prompt";
import {CheckboxWrapper} from "./styles/Checkbox";

class Login extends Component {
    Auth = new AuthHelperMethods();

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            stayLoggedIn: true,
            prompt: "",
            promptColor: "",
            resendConf: false,
            logoDeg: 0
        };
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

    _handleCheckboxChange = () => {
        this.setState(
            {
                stayLoggedIn: !this.state.stayLoggedIn
            }
        );
    };

    handleFormSubmit = (e) => {
        e.preventDefault();
        this.displayPrompt("");
        /* Here is where all the login logic will go. Upon clicking the login button,
        we would like to utilize a login method that will send our entered credentials
        over to the server for verification. Once verified, it should store your token
        and send you to the protected route. */
        if (!email_validator.validate(this.state.email)) {
            this.displayPrompt("Email is not valid");
        } else if (!this.state.password || this.state.password.length < 8) {
            this.displayPrompt("Password must be at least 8 characters");
        } else {
            // All validations passed, send login POST request
            this.Auth.login(this.state.email, this.state.password, this.state.stayLoggedIn)
                .then(res => {
                    if (res.error) {
                        this.displayPrompt(res.error, res.color, res.resend_conf);
                        return;
                    }
                    // No error, continue to dashboard
                    this.props.history.replace("/");
                })
                .catch(err => {
                    alert(err);
                });
        }
    };

    displayPrompt = (prompt, color, resendConf) => {
        this.setState({
            prompt: prompt,
            promptColor: color || "red",
            resendConf: resendConf || false
        });
    };

    resendConfirmationEmail = () => {
        const data = {
            email: this.state.email
        };
        if (data.email && email_validator.validate(data.email)) {
            axios.post("/resend_account_activation_email", data).then((response) => {
                if (response.data && response.data.error) {
                    // Display error message
                    this.displayPrompt(response.data.error);
                    return;
                }
                this.displayPrompt("Email sent. Please check your email", "green", false);
            })
        }
    };

    componentWillMount() {
        // Redirect someone who is already logged in to the protected route
        if (this.Auth.loggedIn()) this.props.history.replace('/');
    };

    render() {
        return (
            <React.Fragment>
                <Helmet>
                    <title>Log In</title>
                </Helmet>
                <div className="login-body-wrapper">
                    <Particles/>
                    <div className="login-wrapper">
                        <div className="login-logo-wrapper">
                            {/* <img className="logo-img" style={{transform: 'rotate(' + this.state.logoDeg + 'deg)'}}
                                 src={logo} alt={"logo"}/> */}
                            <p><span>Log In</span></p>
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
                                placeholder="Password"
                                name="password"
                                type="password"
                                onChange={this._handleChange}
                            />
                            <CheckboxWrapper>
                                <input
                                    name="stayLoggedIn"
                                    type="checkbox"
                                    checked={this.state.stayLoggedIn}
                                    onChange={this._handleCheckboxChange}
                                />
                                <label className="noselect" onClick={this._handleCheckboxChange}>Remember me</label>
                            </CheckboxWrapper>
                            <button className="form-submit" onClick={this.handleFormSubmit}>Log In</button>
                        </form>
                        {this.state.prompt.length > 0 &&
                        <Prompt message={this.state.prompt} color={this.state.promptColor}
                                resendConf={this.state.resendConf}
                                resendConfirmationEmail={this.resendConfirmationEmail}/>}
                        <div><Link className="link" to="/signup">Don't have an account? <span>Sign Up</span></Link></div>
                        <div><Link className="link" to="/password"><span>Forgot password?</span></Link></div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
export default Login;
