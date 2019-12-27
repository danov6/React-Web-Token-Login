import React, {Component} from "react";
import {Wrapper, Text, Link} from './styles/Prompt';

export class Prompt extends Component {
    render() {
        // Set default theme
        let theme = {
            mainBorder: "#F4485B",
            mainBackground: "rgba(244,72,91,0.1)",
            mainColor: "#ED3448"
        };
        // Update theme
        if (this.props.color === "yellow") {
            theme.mainBorder = "#DFBA0A";
            theme.mainBackground = "rgba(223,186,10,0.1)";
            theme.mainColor = "#A88F1A";
        } else if (this.props.color === "green") {
            theme.mainBorder = "#14C76F";
            theme.mainBackground = "rgba(20,199,111,0.1)";
            theme.mainColor = "#11AF61";
        }
        return (
            <Wrapper theme={theme}>
                <Text>{this.props.message}</Text>
                {this.props.resendConf && this.props.resendConfirmationEmail &&
                <Text onClick={this.props.resendConfirmationEmail}>. <Link>Resend Confirmation</Link></Text>}
            </Wrapper>
        );
    }
}