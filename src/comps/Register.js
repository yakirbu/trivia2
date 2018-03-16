import React, { Component } from 'react';

//CSS
import './Register.css';

//COMPS
import MainGame from './MainGame';
import DatabaseHandler from './DatabaseHandler';

//IMG
import game_logo from '../images/logo-icon.png'


var that;
class Register extends Component {

    constructor(props) {
        super(props);

        that = this;

        this.state = {
            verified: false,
        }
    }

    isRegistered() {
        var phoneNum = document.getElementById("phoneNum").value;
        if (phoneNum.length > 5) {
            console.log("מספר תקין!");
            DatabaseHandler.getDataOnceWhere(["Users"], ["phone", phoneNum], (snapshot) => {
                if (snapshot) {
                    //already verified
                    snapshot.forEach(function (childSnapshot) {
                        DatabaseHandler.user = childSnapshot.val();
                        that.setState({
                            verified: true
                        })
                        console.log(childSnapshot.val().name);
                    });
                }
                else
                    console.log("doesn't exists!")
            })
        }
        else {
            console.log('אין מספיק ספרות!');
        }


    }


    render() {
        return (
            <div>
                {!this.state.verified ?
                    <div className="register_container">
                        <img className="game_logo" src={game_logo} />

                        <div className="text_w_input">
                            <h3>הזן את מס' הפלאפון שלך</h3>
                            <input id="phoneNum" type="text" maxLength="11" placeholder="הזן מספר פלאפון" />

                            <div onClick={this.isRegistered} className="game_button">
                                הרשם
                        </div>

                        </div>


                    </div>
                    : <MainGame />}
            </div>
        )
    }
}


export default Register;