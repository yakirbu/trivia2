import React, { Component } from 'react';
import MainGame from './MainGame';
import { Helmet } from "react-helmet";


import './MainScreen.css';

//IMG
import game_logo from '../images/logo-icon.png'


class MainScreen extends Component {

    render() {
        return (
            <div className="m_s_m">

                <div className="main_screen_container">
                    <img className="game_logo" src={game_logo} />

                    <div className="game_desc">
                        <h3>₪1500</h3>
                        <h4>המשחק הבא: יום שני, 21:00</h4>
                    </div>

                    <div className="game_player_data">
                        <div className="p_items_container">
                            <div className="player_data_item">
                                <div className="p_d_text">
                                    <h3>יקיר בוכריס</h3>
                                    <h4>מזהה משתמש: 15343656</h4>
                                </div>
                            </div>

                            <div className="player_data_item">
                                <div className="p_d_text">
                                    <h3>יתרה: ₪0</h3>
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

                </div>




                {/* BOTTOM-BAR */}
                <div className="main_game_bottom">
                    <div className="bottom_buttons">
                        <div className="game_button">
                            שיאים
                        </div>

                        <div className="game_button">
                            שיאים
                        </div>
                    </div>
                </div>


            </div>
        )
    }
}


export default MainScreen;