import React, { Component } from 'react';


//COMPS
import MainGame from './MainGame';
import Register from './Register';

class Auth extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>

                {/* TO:DO - REGISTRATION */}
                <Register />
            </div>
        )
    }
}


export default Auth;