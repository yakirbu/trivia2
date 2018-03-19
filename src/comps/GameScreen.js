import React, { Component } from 'react';
import Hls from 'hls.js';
import $ from 'jquery';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import './GameScreen.css';

//COMPS
import { DatabaseHandler } from './DatabaseHandler';

//SOUND
import qStartSound from '../audio/question.mp3';
import chooseOptionSound from '../audio/selection.mp3';
import rightAnsSound from '../audio/rightAns.mp3';
import wrongAnsSound from '../audio/wrongAns.mp3';
window.createjs.Sound.registerSound(qStartSound, "qStartSound");
window.createjs.Sound.registerSound(chooseOptionSound, "chooseOptionSound");
window.createjs.Sound.registerSound(rightAnsSound, "rightAnsSound");
window.createjs.Sound.registerSound(wrongAnsSound, "wrongAnsSound");


var that;
var timer;
var questionStarted = false;
var currTime = 0;
const QUESTION_TIME = 10;
var userChosenOption = 0;
var showingResults = false;
var lastQStat = "";
var lastQDataStat = "";
var videoPlaying = false;
var qNumAns = {};
var video;
var videoInter;
class GameScreen extends Component {
    constructor(props) {
        super(props);

        that = this;

        this.state = {
            time: 0
        }

    }


    componentDidMount() {
        setTimeout(() => {
            this.controlVideo();
        }, 500);

    }


    controlVideo() {
        console.log("opening: " + that.props.general.streamStatus + " " + videoPlaying)
        if (that.props.general.streamStatus == 'active' && !videoPlaying) {
            video = document.getElementById('video');
            //start streaming
            if (Hls.isSupported()) {
                if (!video)
                    return;
                var hls = new Hls();
                console.log("stream addess: " + this.props.general.streamAddress)
                hls.loadSource(this.props.general.streamAddress);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    videoPlaying = true;
                    video.play();
                    setInterval(that.updateVideo(), 24);
                    that.videoInter = setInterval(() => that.advanceVideo(2), 5000);
                    //that.advanceVideo(5);
                });

            }
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = this.props.general.streamAddress;
                video.addEventListener('canplay', function () {
                    video.play();
                });
            }
        }
        else if (that.props.general.streamStatus == 'off' && videoPlaying) {
            videoPlaying = false;
            if (video)
                video.pause();
        }

    }


    updateVideo() {
        console.log("wtf is going on")
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var myVideo = document.getElementById('video');
        ctx.drawImage(myVideo, 0, 0, 640, 480);

        /*
        var currTime = myVideo.currentTime;
        var dur = myVideo.duration;
        console.log(currTime + " " + dur)
        if (currTime < dur)
            myVideo.currentTime += (dur - currTime);
            */
    }

    advanceVideo(times) {
        var video = document.getElementById('video');
        var currTime = video.currentTime;
        var dur = video.duration;
        if (dur - currTime > 3)
            video.currentTime += (dur - currTime) / 2;
        console.log(currTime + " " + dur)
        /*
        if (times > 0) {
            setTimeout(() => {
                video = document.getElementById('video');
                video.currentTime = video.currentTime + 3;
                that.advanceVideo(times - 1);
            }, 1000)
        }
        */

    }


    videoMode(mode) {
        return;
        if (mode == 'question') {
            $('#video_div, #video').removeClass('q_video_large');
            $('#video_div, #video').addClass('q_video_large');
            /*
            $('.q_video').css({
                "position": "absolute",
                "left": "0",
                "top": "0",
                "width": "50px",
                "height": "50px",
                "border-radius": "50px",
                "margin-left": "25px",
                "z-index": "3",
            }) */
        }
        else {
            $('#video_div, #video').removeClass('q_video_small');
            $('#video_div, #video').addClass('q_video_large');
            /*
            $('.q_video').css({
                "position": "static",
                "border-radius": "0px",
                "margin-left": "0px",
                "z-index": "-1",
            })
            */
        }

    }



    calculateTime() {
        var obj = document.getElementsByClassName("react-sweet-progress-symbol")[0];

        currTime += 100;
        var timeLeft = QUESTION_TIME - ((currTime - that.props.question.startTime) / 1000);
        //console.log(timeLeft);
        if (timeLeft > 0) {
            that.setState({
                time: (timeLeft / QUESTION_TIME) * 100
            }, () => {
                if (obj)
                    obj.innerHTML = Math.round(timeLeft);
            })
        }
        else {
            console.log("end!")
            that.setState({
                time: 0
            }, () => {
                if (obj)
                    obj.innerHTML = Math.round(0);
                clearInterval(that.timer);
                this.endQuestion();
            })
        }
    }


    //lock all options
    //specificNum: one option chosen
    lockOptions(specificNum) {
        for (var i = 1; i < 4; i++) {
            $('#option' + i).css({
                "background-color": "#eaeaea",
                "cursor": "context-menu",
                "border": "1.5px #eaeaea solid",
                "color": "#aeaeae"
            });
        }
        if (specificNum) {
            $('#option' + specificNum).css({
                "background-color": "#dad3ed",
                "color": "#968bb4",
                "border": "1.5px rgb(213, 206, 235) solid",
                "cursor": "context-menu"
            });
        }
    }


    resetOptions() {
        showingResults = false;
        userChosenOption = 0;
        for (var i = 1; i < 4; i++) {
            $('#option' + i).css({
                "background-color": "white",
                "color": "#aeaeae",
                "border": "1.5px #eaeaea solid",
                "cursor": "pointer"
            });
            $('.results').css({ "clip-path": "inset(0px 100% 0px 0px)" })
        }
    }


    chooseOption(optionNum) {
        if (this.props.user.gameStatus == 'active' && questionStarted && userChosenOption == 0) {
            this.resetOptions();
            this.lockOptions(optionNum);
            userChosenOption = optionNum;

            that.isUserStillActive((active) => {
                if (active) {
                    setTimeout(function () {
                        window.createjs.Sound.play("chooseOptionSound");
                    }, 50);

                    DatabaseHandler.updateUserAns(that.props.question.num, userChosenOption,
                        that.props.user.createdAt, that.props.game.startTime, that.props.question.questionId, (s) => {
                            console.log("completed!");
                        })
                }
                else {
                    that.lockOptions();
                    DatabaseHandler.updateUserGameStatus(this.props.user.createdAt, "watching", (s) => { });
                    console.log("You are out of the game");
                }
            })
        }
        else
            that.lockOptions();
    }


    isUserStillActive(callback) {
        if (!this.props.user.gameStatus == 'active') {
            console.log("User is not active in current game");
            callback(false);
        }
        else {
            //If this is the first question, user can join
            if (this.props.question.num == 1) {
                callback(true);
            }
            else {
                //If question&answers list is null, get the last questionData and compare with user previous answers
                if (!qNumAns[this.props.question.num - 1]) {
                    DatabaseHandler.getDataOnceWhere(["Questions", this.props.game.startTime], ["num", this.props.question.num - 1], (que) => {
                        DatabaseHandler.getDataOnce(["QuestionData", que.val().questionId], (qData) => {
                            DatabaseHandler.getDataOnce(['UserAns', this.props.user.createdAt, this.props.game.startTime], (ans) => {
                                if (ans && ans.val()[this.props.question.num - 1]) {
                                    if (qData.val().ans == ans.val()[this.props.question.num - 1]) {
                                        callback(true);
                                    }
                                    else
                                        callback(false);
                                }
                                else
                                    callback(false);
                            });
                        })
                    });
                }
                //if question&answers are defined, check if user answered correctly on previous answer
                else {
                    DatabaseHandler.getDataOnce(['UserAns', this.props.user.createdAt, this.props.game.startTime], (ans) => {
                        if (ans && qNumAns[this.props.question.num - 1] == ans.val()[this.props.question.num - 1]) {
                            callback(true);
                        }
                        else
                            callback(false);
                    });
                }
            }
        }
    }

    start() {

        if (that.props.question.status == 'active') {
            console.log("here");

            that.videoMode("question");

            var t0 = performance.now();
            DatabaseHandler.getTime((time) => {
                var t1 = performance.now();
                console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
                this.resetOptions();
                currTime = time - (t1 - t0);
                that.timer = setInterval(() => that.calculateTime(), 100);

                var timeLeft = ((currTime - that.props.question.startTime) / 1000);
                console.log(timeLeft + " " + (timeLeft * 100));
                if (timeLeft < QUESTION_TIME) {

                    setTimeout(function () {
                        window.createjs.Sound.play("qStartSound", { startTime: (timeLeft * 100), duration: 11000 });
                    }, 50);

                }

            })

        }

    }



    endQuestion() {
        if (userChosenOption == 0)
            this.lockOptions();
        questionStarted = false;
    }



    lockResults(specificNum, isTrue, rightAns) {
        for (var i = 1; i < 4; i++) {
            $('#result' + i).css({
                "background-color": "#eaeaea",
            });
        }
        if (specificNum) {
            $('#result' + specificNum).css({
                "background-color": isTrue ? "#d4f3bf" : "#f3bfbf",
            });
            $('#result' + rightAns).css({
                "background-color": "#d4f3bf",
            });
        }
    }

    showResults() {
        setTimeout(() => {
            var userOpt = userChosenOption;
            qNumAns[this.props.question.num] = this.props.questionData.ans;

            this.resetOptions();
            var data = this.props.questionData;
            var total = data.option1Num + data.option2Num + data.option3Num;

            if (userOpt != 0) {
                var isRight = userOpt == this.props.questionData.ans;
                if (!isRight) {
                    //wrong ans
                    DatabaseHandler.updateUserGameStatus(this.props.user.createdAt, "watching", (s) => { });
                    setTimeout(function () {
                        window.createjs.Sound.play("wrongAnsSound");
                    }, 50);
                }
                else {
                    //right ans
                    setTimeout(function () {
                        window.createjs.Sound.play("rightAnsSound");
                    }, 50);
                }
                this.lockResults(userOpt, isRight, this.props.questionData.ans);
            }
            else {
                DatabaseHandler.updateUserGameStatus(this.props.user.createdAt, "watching", (s) => { });
                this.lockResults(this.props.questionData.ans, true, this.props.questionData.ans);
            }

            var res1 = Math.round(100 - ((data.option1Num / total) * 100));
            this.animate('#result1', "clip-path", 100, res1);

            var res2 = Math.round(100 - ((data.option2Num / total) * 100));
            this.animate('#result2', "clip-path", 100, res2);

            var res3 = Math.round(100 - ((data.option3Num / total) * 100));
            this.animate('#result3', "clip-path", 100, res3);


            console.log(data.option1Num / total + " " + data.option2Num / total + " " + data.option3Num / total)

        }, 10)
    }

    animate(id, type, curr, goal) {
        if (type == "clip-path") {
            if (curr + 1 > goal) {
                setTimeout(() => {
                    $(id).css({ "clip-path": "inset(0px " + curr + "% 0px 0px)" });
                    this.animate(id, type, curr - 1, goal)
                }, 5)
            }
        }
    }

    test(type) {
        if (type == 'add') {
            $('#holder').append('<div id="video_div" className="q_video_large"><video id="video" muted autoPlay loop ></video ><canvas id="canvas" height="50" width="50"></canvas></div >');
            that.startVideo();
        }
        else if (type == 'remove') {
            $('#holder #video_div').remove();
        }
    }

    render() {

        if (this.state.time == 0 && (this.props.question.status == 'active' || this.props.question.status == 'results')) {
            setTimeout(() => {
                var obj = document.getElementsByClassName("react-sweet-progress-symbol")[0];
                if (obj)
                    obj.innerHTML = that.state.time;
            }, 10)
        }

        if (lastQStat != this.props.question.status && this.props.question.status == 'active' && !questionStarted) {
            lastQStat = this.props.question.status;
            console.log("question-starts-now")
            questionStarted = true;
            this.start();
        }

        if (lastQStat != this.props.question.status && !showingResults && this.props.question.status == 'results' && this.props.question && this.props.questionData && this.props.questionData.questionId == this.props.question.questionId) {
            showingResults = true;
            console.log("question-data-starts-now")
            this.showResults();
        }

        lastQStat = this.props.question.status;

        if ((that.props.general.streamStatus == 'active' && !videoPlaying) || (that.props.general.streamStatus == 'off' && videoPlaying)) {
            this.controlVideo();
        }



        return (
            <div>
                <div className="game_screen_container">
                    <div id="holder">

                    </div>

                    {/*
                    <button onClick={() => this.test("add")}>add</button>
                    <button style={{ zIndex: "3" }} onClick={() => this.test("remove")}>remove</button> */}


                    <div className="q_b_c" style={{ visibility: this.props.question.status == 'active' || this.props.question.status == 'results' ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                        <div className="title_question_container">
                            <h5 style={{ fontWeight: 500 }}>{"שאלה " + this.props.question.num}</h5>
                        </div>
                        <div className="question_container">

                            <div className="question_timer">
                                <h3 className="p_status" style={{ textAlign: 'center', color: this.props.user.gameStatus == 'active' ? "rgb(171, 212, 143)" : "#f3bfbf" }} >{this.props.user.gameStatus == 'active' ? "פעיל" : "לא פעיל"}</h3>


                                <Progress
                                    status="active"
                                    style={{ height: "10" }}
                                    type="circle"
                                    strokeWidth={5}
                                    percent={this.state.time}
                                />

                                <div id="video_div" style={{ visibility: this.props.general.streamStatus == 'active' ? 'visible' : 'hidden' }} className={this.props.question.status == 'active' || this.props.question.status == 'results' ? "q_video_small" : "q_video_large"}>
                                    <video id="video" muted autoPlay loop className={this.props.question.status == 'active' || this.props.question.status == 'results' ? "q_video_small" : "q_video_large"} ></video>
                                    <canvas id="canvas" height="50" width="50"></canvas>
                                </div>
                            </div>

                            <div className="q_w_ans">
                                <div className="question_text">
                                    <h3>{this.props.question.question}</h3>
                                </div>

                                <div className="question_options">
                                    <div id="option1" onClick={() => this.chooseOption(1)} className="q_option">
                                        <div className="option_text">
                                            <h5>{this.props.question.status == 'results' ?
                                                this.props.question.option1 + " (" + this.props.questionData.option1Num + ")" :
                                                this.props.question.option1}</h5>
                                        </div>
                                        <div id="result1" className="results" />

                                    </div>
                                    <div id="option2" onClick={() => this.chooseOption(2)} className="q_option">
                                        <div className="option_text">
                                            <h5>{this.props.question.status == 'results' ?
                                                this.props.question.option2 + " (" + this.props.questionData.option2Num + ")" :
                                                this.props.question.option2}</h5>
                                        </div>
                                        <div id="result2" className="results" />
                                    </div>
                                    <div id="option3" onClick={() => this.chooseOption(3)} className="q_option">
                                        <div className="option_text">
                                            <h5>{this.props.question.status == 'results' ?
                                                this.props.question.option3 + " (" + this.props.questionData.option3Num + ")" :
                                                this.props.question.option3}</h5>
                                        </div>
                                        <div id="result3" className="results" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div >
            </div >
        )
    }
}


export default GameScreen;