import React, { Component } from 'react';
import $ from 'jquery';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import './GameScreen.css';

//COMPS
import { DatabaseHandler } from './DatabaseHandler';

var that;
var timer;
var questionStarted = false;
var currTime = 0;
const QUESTION_TIME = 10;
var userChosenOption = 0;
class GameScreen extends Component {
    constructor(props) {
        super(props);

        that = this;

        this.state = {
            time: 0
        }

    }


    componentDidMount() {

        //that.timer = setInterval(() => that.test(), 100);

    }

    test() {
        var obj = document.getElementsByClassName("react-sweet-progress-symbol")[0];

        currTime += 100;
        var timeLeft = QUESTION_TIME - ((currTime - that.props.question.startTime) / 1000);
        console.log(timeLeft);
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
            $('#option' + i).css({ "background-color": "#eaeaea" });
        }
        if (specificNum) {
            $('#option' + specificNum).css({
                "background-color": "#dad3ed",
                "color": "#968bb4",
                "border": "1.5px rgb(213, 206, 235) solid"
            });
        }
    }


    resetOptions() {
        userChosenOption = 0;
        for (var i = 1; i < 4; i++) {
            $('#option' + i).css({
                "background-color": "white",
                "color": "#aeaeae",
                "border": "1.5px #eaeaea solid"
            });
        }
    }


    chooseOption(optionNum) {
        if (questionStarted && userChosenOption == 0) {
            this.resetOptions();
            this.lockOptions(optionNum);
            userChosenOption = optionNum;
        }
    }

    start() {

        if (this.props.question.status == 'active') {
            console.log("here");
            setTimeout(() => {
                var obj = document.getElementsByClassName("react-sweet-progress-symbol")[0];
                if (obj)
                    obj.innerHTML = that.state.time;
            }, 10)

            DatabaseHandler.getTime((time) => {
                this.resetOptions();
                currTime = time;
                that.timer = setInterval(() => that.test(), 100);


                //timeLeft = (currTime - that.props.question.startTime) / 1000;
                //console.log((time - that.props.question.startTime) / 1000);
            })

        }

    }



    endQuestion() {
        if (userChosenOption == 0)
            this.lockOptions();
        questionStarted = false;
    }

    render() {
        if (this.props.question.status == 'active' && !questionStarted) {
            questionStarted = true;
            this.start();
        }

        return (
            <div>
                <div className="game_screen_container">

                    {this.props.question.status == 'active' ?
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                            <div className="title_question_container">
                                <h5 style={{ fontWeight: 500 }}>שאלה 2</h5>
                            </div>
                            <div className="question_container">

                                <div className="question_timer">
                                    <Progress
                                        status="active"
                                        style={{ height: "10" }}
                                        type="circle"
                                        strokeWidth={5}
                                        percent={this.state.time}
                                    />
                                </div>

                                <div className="q_w_ans">
                                    <div className="question_text">
                                        <h3>{this.props.question.question}</h3>
                                    </div>

                                    <div className="question_options">
                                        <div id="option1" onClick={() => this.chooseOption(1)} className="q_option">
                                            <h5>{this.props.question.option1}</h5>
                                        </div>
                                        <div id="option2" onClick={() => this.chooseOption(2)} className="q_option">
                                            <h5>{this.props.question.option2}</h5>
                                        </div>
                                        <div id="option3" onClick={() => this.chooseOption(3)} className="q_option">
                                            <h5>{this.props.question.option3}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> : ''}


                </div >
            </div >
        )
    }
}


export default GameScreen;