import React, { Component } from 'react';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import './GameScreen.css';

var that;
var timer;
class GameScreen extends Component {
    constructor(props) {
        super(props);

        that = this;

        this.state = {
            time: 100
        }

    }


    componentDidMount() {
        document.getElementsByClassName("react-sweet-progress-symbol")[0].innerHTML = that.state.time;

        that.timer = setInterval(() => that.test(), 100);
    }

    test() {
        if (that.state.time - 1 > 0) {
            that.setState({
                time: that.state.time - 1
            }, () => {
                document.getElementsByClassName("react-sweet-progress-symbol")[0].innerHTML = Math.round(that.state.time / 10);
            })
        }
        else {
            that.setState({
                time: 0
            }, () => {
                document.getElementsByClassName("react-sweet-progress-symbol")[0].innerHTML = Math.round(that.state.time / 10);
                clearInterval(timer);
            })

        }



    }

    render() {
        return (
            <div>
                <div onClick={() => this.test()} className="game_screen_container">
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






                    </div>
                </div>
            </div>
        )
    }
}


export default GameScreen;