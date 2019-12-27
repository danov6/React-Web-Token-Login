import React, {Component} from "react";
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {TopbarWrapperEl} from "./styles/TopbarWrapper";
import { initUser } from '../../actions/index';

const mapStateToProps = function (state) {
    return state;
};

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators({
        initUser: initUser
    }, dispatch)
};

class TopbarWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {}
        };
        // this.displayPrompt = this.displayPrompt.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.user !== state.user) {
            return {
                user: props.user
            }
        }
        // Return null to indicate no change to state.
        return null;
    }

    componentDidMount() {
        //now has access to data like this.props.something, which is from store
        //now has access to dispatch actions like this.props.getSomething
    }

    render() {
        return (
            <React.Fragment>
                <TopbarWrapperEl>
                    <p>{this.state.user.display_name}</p>
                </TopbarWrapperEl>
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopbarWrapper);