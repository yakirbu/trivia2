import React, { Component } from 'react';
import * as firebase from "firebase";

//CSS
import './Register.css';

//COMPS
import MainGame from './MainGame';
import DatabaseHandler from './DatabaseHandler';

//IMG
import game_logo from '../images/logo-icon.png'



class Register extends Component {

    isRegistered() {
        console.log("הרשמה");
    }


    render() {
        return (
            <div>

                <div className="register_container">
                    <img className="game_logo" src={game_logo} />

                    <div className="text_w_input">
                        <h3>הזן את מס' הפלאפון שלך</h3>
                        <input id="phoneNum" type="text" placeholder="הזן מספר פלאפון" />

                        <div onClick={this.isRegistered} className="game_button">
                            הרשם
                        </div>

                    </div>


                </div>


                {/* TO:DO - REGISTRATION 
                <MainGame />
                */}
            </div>
        )
    }
}


export default Register;