import React, {Component} from 'react';
import axios from "axios";
import TopbarWrapper from './components/topbar/TopbarWrapper';

/* Once the 'Authservice' and 'withAuth' components are created, import them into App.js */
import AuthHelperMethods from './components/AuthHelperMethods';

// Our higher order component
import withAuth from './components/withAuth';

// Import Redux
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers';

const store = createStore(rootReducer);

class App extends Component {
    Auth = new AuthHelperMethods();

    _handleLogout = () => {
        this.Auth.logout();
        this.props.history.replace('/login');
    };

    initUser = function () {
        // Set axios JWT
        let token = localStorage.getItem("login_token") || window.login_token; //change name?
        if (token) {
            // Set axios defaults to include JWT in requests
            axios.defaults.headers.common = {'Authorization': 'Bearer ' + token};
            console.log("[ App ] this.props.confirm:", this.props.confirm);
            console.log("[ App ] Fetch user data with _id: " + this.props.confirm._id);
            axios.get("/api/user").then((response) => {
                if (response.data && response.data.error) {
                    // Display error message
                    alert(response.data.error);
                    return;
                }
                const userData = response.data;
                console.log("[ App ] userData:", userData);
                store.dispatch({
                    type: 'LOGIN',
                    user: userData
                });
            }).catch(error => {
                console.log(error)
            });
        } else {
            console.log("[ App ] Error: No token found!");
            this.props.history.replace('/login');
        }
    };

    componentWillMount() {
        this.initUser();
    }

    // Render the protected component
    render() {

        // store.dispatch({
        //     type: 'LOGIN',
        //     user: {
        //         email: this.props.confirm.email
        //     }
        // });
        return (
            <Provider store={store}>
                <TopbarWrapper/>
                <button onClick={this._handleLogout}>logout</button>
            </Provider>
        );
    }
}

// In order for this component to be protected, we must wrap it with what we call a 'Higher Order Component' or HOC.
export default withAuth(App);