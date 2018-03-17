import React, { Component } from 'react';


//COMPS
import MainGame from './MainGame';
import Register from './Register';

//TESTING PURPOSES - DELETE
import GameScreen from './GameScreen';

class Auth extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>

                {/* TO:DO - REGISTRATION */}
                <Register />
                {/*
                <GameScreen /> */}
            </div>
        )
    }
}


export default Auth;