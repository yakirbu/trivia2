import React, { Component } from 'react';
import Hls from 'hls.js';
import { database, DatabaseHandler } from './DatabaseHandler';

//CSS
import './MainGame.css';

//IMAGES
import heartIcon from '../images/heart-icon.png';
import muteIcon from '../images/mute.png';
import unmuteIcon from '../images/unmute.png';

//COMPS
import MainScreen from '../comps/MainScreen';
import GameScreen from '../comps/GameScreen';

var video;
var that;
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


        /*

        //start streaming
        if (Hls.isSupported()) {
            video = document.getElementById('video');
            var hls = new Hls();
            hls.loadSource('http://77.138.49.203:1935/live/rtmp.stream/playlist.m3u8');
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });

        }
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'http://77.138.49.203:1935/live/rtmp.stream/playlist.m3u8';
            video.addEventListener('canplay', function () {
                video.play();
            });
        }
        */

    }

    playVid(video) {
        video = document.getElementById('video');
        video.muted = !video.muted;
        video.currentTime = video.currentTime + 20;

        that.setState({
            mute: !that.state.mute
        })
    }



    render() {
        return (
            <div>
                {/*
                <video id="video" muted autoPlay loop></video> */}
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

                            <div className="h_b_startButt">
                                <a onClick={this.playVid}>
                                    <img width="25" height="25" src={this.state.mute ? unmuteIcon : muteIcon} />
                                </a>
                            </div>
                        </div>
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



                </div>
            </div>
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