import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import App from './App';
import About from './components/About';
import Signup from './components/login/Signup';
import Login from './components/login/Login';
import Password from './components/login/Password';

import registerServiceWorker from './registerServiceWorker';

const routing = (
    <Router>
      <div>
        <Route exact path="/" component={App} />
        <Route exact path="/about" component={About} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/password" component={Password} />
      </div>
    </Router>
);

ReactDOM.render(routing, document.getElementById('root'));
registerServiceWorker();
