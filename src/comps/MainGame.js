import React, { Component } from 'react';
import Hls from 'hls.js';
import { database, DatabaseHandler } from './DatabaseHandler';
import $ from 'jquery';

//CSS
import './MainGame.css';

//IMAGES
import heartIcon from '../images/heart-icon.png';
import muteIcon from '../images/mute.png';
import unmuteIcon from '../images/unmute.png';
import fullscreenIcon from '../images/fullscreen.png';
import settingsIcon from '../images/settings.png';
import logoIcon from '../images/logo-icon.png'


//COMPS
import MainScreen from '../comps/MainScreen';
import GameScreen from '../comps/GameScreen';

var video;
var that;
var firstTimeCall = false;
var fullscreen = false;
class MainGame extends Component {

    constructor(props) {
        super(props);

        that = this;
        this.state = {
            mute: true,
            general: {},
            currentGame: {},
            currentQuestion: {},
            currQuestionData: {},
            startGame: false,
        }

    }

    startGame() {
        DatabaseHandler.updateUserGameStatus(this.props.user.createdAt, "active", (s) => {
            that.setState({
                startGame: true,
            })
        })

    }

    componentDidMount() {

        //listen to general changes
        DatabaseHandler.listen('/General', (general) => {
            this.setState({ general: general.val() });

            //listen to game changes
            DatabaseHandler.listen('/Games/' + general.val().currentGame, (game) => {
                this.setState({
                    currentGame: game.val(),
                    startGame: game.val().status != 'active' ? false : this.state.startGame
                });
                console.log("currentQuestion in game is now: " + game.val().currentQuestionId);

                //listen to current question changes
                DatabaseHandler.listen('/Questions/' + game.key + "/" + game.val().currentQuestionId, (question) => {
                    console.log("question-" + question.key)

                    //getting current question data once
                    if (question.val().status == "results") {
                        DatabaseHandler.getDataOnce(["QuestionData", question.key], (qData) => {
                            console.log("questionDataOnce-" + question.key)
                            this.setState({ currQuestionData: qData.val() }, () => {
                                this.setState({ currentQuestion: question.val() });
                            });
                        });
                    }
                    else
                        this.setState({ currentQuestion: question.val() });

                }, "question");
            });

        })


        $('html').css({ "height": window.screen.height + "px" });

    }

    playVid() {
        video = document.getElementById('video');
        if (!video)
            return;
        video.muted = !video.muted;
        video.currentTime = video.currentTime + 20;

        that.setState({
            mute: !that.state.mute
        })
    }


    toggleFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
        else {
            cancelFullScreen.call(doc);
        }
        fullscreen = !fullscreen;

        var height = window.screen.height;
        console.log("height: " + height);
        $('html').css({ "height": height + "px" })
    }



    render() {

        if (!firstTimeCall && this.state.currentGame.startTime != undefined) {
            firstTimeCall = true;

            var id = this.props.user.createdAt;
            var gameId = this.state.currentGame.startTime;

            DatabaseHandler.addUserOnline(gameId, (s) => {
                console.log("gid" + gameId);
                var diconnectRef = database.ref('Disconnect');
                var connectedRef = database.ref('.info/connected');
                connectedRef.on('value', function (snap) {
                    if (snap.val() === true) {

                        var obj = {};
                        obj[id] = gameId;
                        diconnectRef.onDisconnect().set(obj);

                        console.log("test");
                    }
                });
            });


        }

        return (
            <div className="main_game_container">

                {/* TOP-BAR */}
                <div className="game_top_bar">
                    <div className="g_t_b_wrapper">
                        <div className="heart_bar">
                            <div className="h_icon">
                                <img height="23" src={heartIcon} />
                            </div>
                            <div className="h_text">
                                <span>1</span>
                            </div>
                        </div>

                    </div>
                </div>


                <div className="side_menu">
                    <div className="side_menu_item">
                        <div className="h_b_startButt">
                            <a href={window.location.href.match(/^.*\//)}>
                                <img width="25" height="20" src={logoIcon} />
                            </a>
                        </div>
                    </div>

                    <div className="side_menu_item">
                        {this.state.general.streamStatus == 'active' ?
                            <div className="h_b_startButt">
                                <a onClick={this.playVid}>
                                    <img width="25" height="25" src={this.state.mute ? unmuteIcon : muteIcon} />
                                </a>
                            </div> : ''}
                    </div>

                    <div className="side_menu_item">
                        <div className="h_b_startButt">
                            <a onClick={this.toggleFullScreen}>
                                <img width="23" height="23" src={fullscreenIcon} />
                            </a>
                        </div>
                    </div>

                    {/* SETTINGS SIDE MENU ? 
                    <div className="side_menu_item">
                        {this.state.general.streamStatus == 'active' ?
                            <div className="h_b_startButt">
                                <a onClick={this.playVid}>
                                    <img width="23" height="23" src={settingsIcon} />
                                </a>
                        </div> 
                    </div> */}
                </div>


                <div className="main_screen_g">
                    {!this.state.startGame ?
                        <MainScreen2 />
                        :
                        <GameScreen
                            general={that.state.general}
                            game={this.state.currentGame}
                            question={this.state.currentQuestion}
                            questionData={this.state.currQuestionData}
                            user={this.props.user}
                        />
                    }
                </div>



            </div >
        )
    }
}

function MainScreen2() {
    return (
        <MainScreen
            game={that.state.currentGame}
            general={that.state.general}
            user={that.props.user}
            startGame={() => that.startGame()}
        />
    )
}


export default MainGame;