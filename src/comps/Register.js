import React, { Component } from 'react';
import { databases, auth, DatabaseHandler } from './DatabaseHandler';
import * as firebase from 'firebase';
import $ from 'jquery';
import { Progress } from 'react-sweet-progress';

//CSS
import './Register.css';

//COMPS
import MainGame from './MainGame';

//IMG
import game_logo from '../images/logo-icon3.png'
import bg_img from '../images/bg2.jpg';

var loadingInter;

var that;
class Register extends Component {

    constructor(props) {
        super(props);

        that = this;

        this.state = {
            gameLoad: 0,
            loading: true,
            auth: false,
            name: "",
            verified: false,
            smsSent: false,
            recaptcha: false,
            user: null,
        }

        that.loadingInter = setInterval(() => { that.updateGameLoad() }, 500);
    }


    updateGameLoad() {
        that.setState({ gameLoad: that.state.gameLoad + 20 });
        console.log(that.state.gameLoad);
    }

    componentDidMount() {
        this.startFunctions();
    }


    startFunctions() {

        DatabaseHandler.getAvailableDatabase((selected) => {
            console.log("selected-database: " + selected);


            var connectedRef = databases[DatabaseHandler.selected].ref('.info/connected');
            setTimeout(() => {
                connectedRef.once('value', function (snap) {
                    if (snap.val() === true) {
                        console.log("ONLINE");

                        DatabaseHandler.addUserOnlineWrapper(() => {
                            that.listenToAuth();
                        });
                    }
                    else {
                        console.log("NOT ONLINE");
                        setTimeout(() => {
                            that.startFunctions();
                        }, 5000);
                    }
                });
            }, 2000);

        });

        $('body').css({ 'background': 'url(' + bg_img + ') no-repeat center', 'background-size': 'cover' });

    }


    listenToAuth() {

        auth.onAuthStateChanged(function (user) {
            if (user) {
                var userPhone = "0" + user.phoneNumber.replace("+972", "");


                DatabaseHandler.getDataOnceWhere(["Users"], ["phone", userPhone], (childSnapshot) => {
                    if (childSnapshot) {
                        //already verified

                        console.log("verified");

                        DatabaseHandler.listen("Users/" + childSnapshot.key, (us) => {
                            that.setState({
                                loading: false,
                                verified: true,
                                user: us.val(),
                            })
                            console.log(us.name);
                        })

                    }
                    else {
                        console.log("unverified");
                        if (that.state.name != "")
                            that.createNewUser(userPhone);
                    }

                    console.log("wtf");
                });


                console.log("logged in " + user.phoneNumber);
            } else {
                // User is signed out.
                // ...
                that.setState({ loading: false });
                console.log("user logged out")
            }

        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!that.state.loading)
            clearInterval(that.loadingInter);
    }


    saveUserName() {
        var userName = document.getElementById("nameText").value;
        if (userName.length > 1) {
            that.setState({
                name: userName,
            }, () => {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                    'size': 'normal',
                    'callback': function (response) {
                        that.setState({
                            recaptcha: true,
                        })
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                        // ...
                    },
                    'expired-callback': function () {
                        // Response expired. Ask user to solve reCAPTCHA again.
                        // ...
                    }
                });
                window.recaptchaVerifier.render().then(function (widgetId) {
                    window.recaptchaWidgetId = widgetId;
                });
            });


        }
        else {
            console.log("יש להזין כינוי")
        }

        document.getElementById("nameText").value = "";
    }

    isRegistered() {
        var phoneNum = document.getElementById("phoneNum").value;
        if (phoneNum.length > 5 && that.state.recaptcha) {
            document.getElementById("phoneNum").value = "";

            console.log("מספר תקין!");

            console.log("doesn't exists!");

            //TO:DO - CHECK PHONE NUMBER SYNTAX
            var appVerifier = window.recaptchaVerifier;
            console.log(appVerifier);
            auth.signInWithPhoneNumber("+972" + phoneNum, appVerifier)
                .then(function (confirmationResult) {
                    that.setState({
                        smsSent: true
                    })
                    // SMS sent. Prompt user to type the code from the message, then sign the
                    // user in with confirmationResult.confirm(code).
                    window.confirmationResult = confirmationResult;
                }).catch(function (error) {
                    console.log(error);
                    // Error; SMS not sent
                    // ...
                });




        }
        else {
            if (!that.state.recaptcha)
                console.log('אנא אמת שאינך רובוט');
            else
                console.log('אין מספיק ספרות!');
        }


    }



    verifySMSCode() {
        var smsCode = document.getElementById("codeNum").value;
        console.log(smsCode);
        if (smsCode.length > 1) {
            window.confirmationResult.confirm(smsCode).then(function (result) {
                // User signed in successfully.
                console.log("correct!")
                var user = result.user;
                //var userPhone = "0" + user.phoneNumber.replace("+972", "");
                //that.createNewUser(userPhone);
                // ...
            }).catch(function (error) {
                // User couldn't sign in (bad verification code?)
                // ...
                console.log("Wrong code");
            });
        }
    }


    createNewUser(phone) {
        DatabaseHandler.getTime(time => {
            var user = {
                name: this.state.name,
                money: 0,
                hearts: 1,
                phone: phone,
                points: 0,
                gameStatus: "off",
                deviceId: 'web',
                createdAt: time,
            }

            var updates = {};
            updates['/Users/' + time] = user;
            return databases[DatabaseHandler.selected].ref().update(updates).then((s) => {

                DatabaseHandler.listen("Users/" + user.createdAt, (us) => {
                    that.setState({
                        verified: true,
                        user: us.val(),
                    })
                    console.log(us.name);
                })

            });

        })

    }


    render() {
        return (
            <div style={{ height: '100%' }}>
                {this.state.loading ?
                    <div style={{ height: '100%', color: 'white', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
                        <Progress type="circle" percent={that.state.gameLoad} />
                    </div> :

                    <div style={{ height: '100%' }}>
                        {!this.state.verified ?
                            <div className="register_container">
                                <img className="game_logo" src={game_logo} />

                                <div className="text_w_input">
                                    {this.state.name == "" ?
                                        <div>
                                            <h3>הזן כינוי</h3>
                                            <input id="nameText" type="text" maxLength="11" placeholder="הזן כינוי" />

                                            <div onClick={this.saveUserName} className="game_button">
                                                הרשם
                                        </div>

                                        </div> :

                                        (!this.state.smsSent ?
                                            <div>
                                                <h3>הזן את מס' הפלאפון שלך</h3>
                                                <input id="phoneNum" type="text" maxLength="11" placeholder="הזן מספר פלאפון" />

                                                <div onClick={this.isRegistered} className="game_button">
                                                    הרשם
                                            </div>

                                                <div id="recaptcha-container" />

                                            </div> :
                                            <div>
                                                <h3>הזן את הקוד שנשלח אליך</h3>
                                                <input id="codeNum" type="text" maxLength="11" placeholder="הזן את הקוד שקיבלת" />

                                                <div onClick={this.verifySMSCode} className="game_button">
                                                    אמת
                                            </div>
                                            </div>)
                                    }



                                </div>


                            </div>
                            : <MainGame user={this.state.user} />}
                    </div>}
            </div>
        )
    }
}


export default Register;