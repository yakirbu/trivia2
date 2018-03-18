import React, { Component } from 'react';
import $ from 'jquery';


import { Helmet } from "react-helmet";




//COMPS
import MainGame from './MainGame';
import Register from './Register';

//TESTING PURPOSES - DELETE
import GameScreen from './GameScreen';

import qStartSound from '../audio/question.mp3';



class Auth extends Component {
    constructor(props) {
        super(props);


        //this.audio = new Audio(qStartSound);
        //this.audio.play()
    }

    componentDidMount() {



        /*
        $('#denied')[0].volume = 0;
        $('#denied')[0].load();
        */
    }

    render() {
        return (
            <div>

                <Helmet>


                </Helmet>

                {/* TO:DO - REGISTRATION 

                <audio autoPlay id="denied" controls="false">
                    <source src={qStartSound} />
                </audio>*/}

                <Register />
                {/*
                <GameScreen /> */}
            </div>
        )
    }
}


export default Auth;