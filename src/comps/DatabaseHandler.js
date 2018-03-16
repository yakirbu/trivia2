import React, { Component } from 'react';
import * as firebase from "firebase";

// Initialize Firebase  
var config = {
    apiKey: "AIzaSyAv8yxEEHKdN3WxehmUJY7G6DSWOBYyrO4",
    authDomain: "questions-59ee6.firebaseapp.com",
    databaseURL: "https://questions-59ee6.firebaseio.com",
    projectId: "questions-59ee6",
    storageBucket: "questions-59ee6.appspot.com",
    messagingSenderId: "418189060782"
};
firebase.initializeApp(config);

var database = firebase.database;
var auth = firebase.auth;

class DatabaseHandler extends Component {



    render() {
        return (
            <div />
        )
    }
}

export default DatabaseHandler;