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

var database = firebase.database();
var auth = firebase.auth();

class DatabaseHandler extends Component {

    constructor(props) {
        super(props);


        //USAGE EXAMPLE:
        this.getDataOnce(["Games", "1518613451928"], (snap) => {
            console.log(snap.val());
        });
    }


    //Template for a single request (not a listener)
    getDataOnce(path, callback) {
        return database.ref('/' + path.join("/")).once('value').then(function (snapshot) {
            callback(snapshot);
        });
    }

    render() {
        return (
            <div />
        )
    }
}

export default DatabaseHandler;