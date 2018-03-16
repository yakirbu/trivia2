import React, { Component } from 'react';
import * as firebase from "firebase";

// Initialize Firebase  
const config = {
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
    static user;

    constructor(props) {
        super(props);


        //USAGE EXAMPLE:
        /*
        this.getDataOnce(["Games", "1518613451928"], (snap) => {
            console.log(snap.val());
        });
        */
    }


    //Template for a single request (not a listener)
    //path: array, callback: function()
    static getDataOnce(path, callback) {
        return database.ref('/' + path.join("/")).once('value').then(function (snapshot) {
            if (snapshot.numChildren() > 0)
                callback(snapshot);
            else
                callback(null);
        });
    }

    //Template for a single request with equalTo query
    //path: array, where: array, callback: function()
    static getDataOnceWhere(path, where, callback) {
        return database.ref('/' + path.join("/")).orderByChild(where[0]).equalTo(where[1]).once('value').then(function (snapshot) {
            if (snapshot.numChildren() > 0)
                callback(snapshot);
            else
                callback(null);
        });
    }


    static getFirebaseAuth() {
        return auth;
    }

    render() {
        return (
            <div />
        )
    }
}

export default DatabaseHandler;