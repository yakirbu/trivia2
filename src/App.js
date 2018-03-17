import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

//COMPS
import MainGame from './comps/MainGame'
import Auth from './comps/Auth'


class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Auth} />
        </div>
      </Router>
    );
  }
}

export default App;
