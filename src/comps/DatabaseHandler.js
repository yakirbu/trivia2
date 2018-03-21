import * as firebase from "firebase";
import axios from 'axios';

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

var listenNodes = [];
var questionListeners = [];
class DatabaseHandler {

    //create a listener for a specific node, avoids double listener to same node
    static listen(path, callback, type) {
        if (listenNodes && !listenNodes.find(item => { return item === path })) {
            listenNodes.push(path);
            if (type == 'question') {
                this.detachListeners();
                questionListeners.push(path);
            }
            else if (type == 'questionData')
                questionListeners.push(path);
            database.ref(path).on('value', (snap) => {
                callback(snap);
            });
        }
        else
            console.log("already listening to this node");
    }

    static detachListeners() {
        questionListeners.forEach(item => {
            console.log("remove-" + item + "-from listening");
            database.ref(item).off();
            questionListeners = questionListeners.filter(e => e != item);
            listenNodes = listenNodes.filter(e => e != item);
        })
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
            if (snapshot.numChildren() > 0) {
                snapshot.forEach(function (childSnapshot) {
                    callback(childSnapshot);
                });
            }
            else
                callback(null);
        });
    }


    static updateUserAns(qnum, ans, uid, gid, qid, callback) {

        //update question num
        database.ref('/QuestionData/' + qid).transaction(function (qData) {
            console.log("0choosen!!! " + qid);
            if (qData) {
                console.log("1choosen!!!");
                if (ans == 1) {
                    console.log("2choosen!!!");
                    qData.option1Num++;
                }
                else if (ans == 2) {
                    qData.option2Num++;
                }
                else if (ans == 3) {
                    qData.option3Num++;
                }
            }
            return qData;
        });


        //update user ans
        var userAns = {};
        userAns[qnum] = ans;
        database.ref("/UserAns/" + uid + "/" + gid).update(userAns).then((s) => {
            callback(s);
        })
    }


    static updateUserGameStatus(uid, status, callback) {
        database.ref('/Users/' + uid).update({ gameStatus: status }).then((s) => {
            callback(s);
        })
    }


    static addUserOnline(gameId, callback) {
        database.ref('/GameStats/' + gameId).transaction((snapData) => {
            if (snapData) {
                snapData.playingUsers++;
            }
            return snapData;
        }).then(s => {
            callback(s);
        });
    }



    static getTime(callback) {
        console.log("getting time now!");
        axios.get('https://us-central1-questions-59ee6.cloudfunctions.net/app/api/time')
            .then(function (response) {
                callback(response.data);
            })
            .catch(function (error) {
                callback(null);
            });
    }

}

export { DatabaseHandler, auth, database };