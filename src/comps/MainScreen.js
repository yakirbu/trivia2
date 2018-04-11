import React, { Component } from 'react';
import MainGame from './MainGame';
import $ from 'jquery';
import { database } from './DatabaseHandler';

import './MainScreen.css';

//IMG
import game_logo from '../images/logo-icon2.png'

var that;
class MainScreen extends Component {


    constructor(props) {
        super(props);

        that = this;

    }

    componentDidMount() {
        /*
        setTimeout(() => {
            var height = window.screen.height - 29;
            $('.m_s_m').css({ "height": height + "px" });
            console.log(height);
        }, 50);
        */
    }

    /*
    startGame() {
        that.setState({
            startGame:true,
        })   
    }
    */

    render() {
        return (
            <div className="m_s_m">

                <div className="main_screen_container">
                    <img className="game_logo" src={game_logo} />

                    <div className="game_desc">

                        {this.props.game != undefined && this.props.game.status == "active" ?
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                {console.log(this.props.game.status)}
                                <h3 style={{ fontSize: '20px', margin: "10px" }}>המשחק התחיל!</h3>
                                <div onClick={() => this.props.startGame(true)} className="game_button" style={{ fontSize: "15px" }}>
                                    הכנס למשחק
                                </div>
                            </div>
                            :
                            this.props.general.bidAmount && this.props.game.status && this.props.game.status == 'off' ?
                                <div>
                                    {console.log(this.props.game.status)}
                                    <h3>{"₪" + this.props.general.bidAmount}</h3>
                                    <h4>{this.props.general.gameDescription}</h4>
                                </div> : ''
                        }


                    </div>

                    <div className="game_player_data">
                        <div className="p_items_container">
                            <div className="player_data_item">
                                <div className="p_d_text">
                                    <h3>{this.props.user.name}</h3>
                                    <h4>{"מזהה משתמש: " + this.props.user.createdAt}</h4>
                                </div>
                            </div>

                            <div className="player_data_item">
                                <div className="p_d_text">
                                    <h3>{"יתרה: ₪" + this.props.user.money}</h3>
                                    <h4>סה"כ זכיות: ₪3499</h4>
                                </div>
                            </div>

                            <div className="player_data_item">
                                <div className="p_d_text">
                                    <h3>חנות</h3>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* BOTTOM-BAR */}
                    <div className="main_game_bottom">
                        <div className="bottom_buttons">
                            <div className="game_button">
                                הגדרות
                        </div>

                            <div className="game_button">
                                המובילים
                        </div>
                        </div>
                    </div>

                </div>



            </div>
        )
    }
}


export default MainScreen;