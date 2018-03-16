import React, { Component } from 'react';


//COMPS
import MainGame from './MainGame';

class Auth extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>

                {/* TO:DO - REGISTRATION */}
                <MainGame />
            </div>
        )
    }
}


export default Auth;