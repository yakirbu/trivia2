import * as firebase from "firebase";
import axios from 'axios';

// Initialize Firebase  
const config = {
    apiKey: "AIzaSyAv8yxEEHKdN3WxehmUJY7G6DSWOBYyrO4",
    authDomain: "questions-59ee6.firebaseapp.com",
    databaseURL: "https://questions-59ee6.firebaseio.com/",
    projectId: "questions-59ee6",
    storageBucket: "questions-59ee6.appspot.com",
    messagingSenderId: "418189060782"
};
var fapp = firebase.initializeApp(config);
var masterdb = null; //firebase.database();
var database1;// = fapp.database("https://12questions-db1.firebaseio.com/");
var database2;// = fapp.database("https://12questions-db2.firebaseio.com/");
var database3;// = fapp.database("https://12questions-db3.firebaseio.com/");
var databases = [masterdb, database1, database2, database3];
var databasesURL = ["https://questions-59ee6.firebaseio.com", "https://12questions-db1.firebaseio.com", "https://12questions-db2.firebaseio.com", "https://12questions-db3.firebaseio.com"];
var databasesState = [false, false, false, false];
//end firebase init

var auth = firebase.auth();

var listenNodes = [];
var questionListeners = [];
const MAX_USERS_DB = 90000;
var onlineTimes = 0;
class DatabaseHandler {
    static selected = 0;


    static getAvailableDatabase(callback) {
        DatabaseHandler.getDatabasesLoad(callback);

        /*
        console.log("here? ");
        DatabaseHandler.selected = 0;
        DatabaseHandler.getDataOnce(["Databases"], (snapshot) => {
            console.log("here2 ");


            var db1 = snapshot.val().db1;
            var db2 = snapshot.val().db2;
            var db3 = snapshot.val().db3;

            if (db1 < MAX_USERS_DB)
                DatabaseHandler.selected = 1;
            else if (db2 < MAX_USERS_DB)
                DatabaseHandler.selected = 2;
            else
                DatabaseHandler.selected = 3;

            for (var i = 1; i < databases.length; i++) {
                if (i !== DatabaseHandler.selected)
                    DatabaseHandler.checkDBState(i, false);
            }

            DatabaseHandler.checkDBState(DatabaseHandler.selected, true);
            callback(DatabaseHandler.selected);
            console.log("databases-load: " + db1 + " " + db2 + " " + db3);

        });
        */
    }

    //check db status
    static checkDBState(pos, state) {
        if (!state && databases[pos] == undefined)
            return;
        else if (state && databases[pos] == undefined)
            databases[pos] = fapp.database(databasesURL[pos]);
        var connectedRef = databases[pos].ref('.info/connected');
        connectedRef.once('value', function (snap) {
            if (snap.val() === true) {
                DatabaseHandler.changeDBState(pos, state, true);
            }
            else {
                DatabaseHandler.changeDBState(pos, state, false);
            }
        });
    }

    //change db state
    static changeDBState(pos, state, serverStatus) {
        //if it's already in that state, return.
        if (serverStatus == state)
            return;

        if (state) {
            databases[pos].goOnline();
            databasesState[pos] = state;
        }
        else {
            databases[pos].goOffline();
            databasesState[pos] = state;
        }

        console.log(databasesState);
    }


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
            databases[DatabaseHandler.selected].ref(path).on('value', (snap) => {
                callback(snap);
            });
        }
        else
            console.log("already listening to this node");
    }

    static detachListeners() {
        questionListeners.forEach(item => {
            console.log("remove-" + item + "-from listening");
            databases[DatabaseHandler.selected].ref(item).off();
            questionListeners = questionListeners.filter(e => e != item);
            listenNodes = listenNodes.filter(e => e != item);
        })
    }


    //Template for a single request (not a listener)
    //path: array, callback: function()
    static getDataOnce(path, callback) {
        return databases[DatabaseHandler.selected].ref('/' + path.join("/")).once('value').then(function (snapshot) {
            if (snapshot.numChildren() > 0)
                callback(snapshot);
            else
                callback(null);
        });
    }

    //Template for a single request with equalTo query
    //path: array, where: array, callback: function()
    static getDataOnceWhere(path, where, callback) {
        return databases[DatabaseHandler.selected].ref('/' + path.join("/")).orderByChild(where[0]).equalTo(where[1]).once('value').then(function (snapshot) {
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
        databases[DatabaseHandler.selected].ref('/QuestionData/' + qid).transaction(function (qData) {
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
        databases[DatabaseHandler.selected].ref("/UserAns/" + uid + "/" + gid).update(userAns).then((s) => {
            callback(s);
        })
    }


    static updateUserGameStatus(uid, status, callback) {
        databases[DatabaseHandler.selected].ref('/Users/' + uid).update({ gameStatus: status }).then((s) => {
            callback(s);
        })
    }


    static addUserOnline(gameId, callback) {
        /*
        databases[0].ref('/Databases/').transaction((snapData) => {
            if (snapData) {
                snapData["db" + this.selected]++;
                //snapData.playingUsers++;
            }
            return snapData;
        }).then(s => {
            callback(s);
        });
        */
        console.log("adding-user-online");
        DatabaseHandler.getTime((time) => {
            var ref = databases[DatabaseHandler.selected].ref('Connect');
            var gameId = DatabaseHandler.selected + "-" + "random";
            var obj = {};
            obj[time] = gameId;
            ref.set(obj);
            callback(true);
        });

    }

    static addUserOnlineWrapper(callback) {
        if (onlineTimes > 0)
            return;
        onlineTimes++;
        var diconnectRef = databases[DatabaseHandler.selected].ref('Disconnect');
        DatabaseHandler.getTime((time) => {
            var gameId = DatabaseHandler.selected + "-" + "random";
            var obj = {};
            obj[time] = gameId;
            diconnectRef.onDisconnect().set(obj).then(s => {
                DatabaseHandler.addUserOnline(gameId, (s) => {
                    //disconnect from master
                    DatabaseHandler.checkDBState(0, false);
                    callback();
                });
            });
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




    // REST ==========
    static getDatabasesLoad(callback) {
        console.log("getting time now!");
        axios.get('https://questions-59ee6.firebaseio.com/Databases.json')
            .then(function (response) {
                var data = response.data;


                var db1 = data.db1;
                var db2 = data.db2;
                var db3 = data.db3;

                if (db1 < MAX_USERS_DB)
                    DatabaseHandler.selected = 1;
                else if (db2 < MAX_USERS_DB)
                    DatabaseHandler.selected = 2;
                else
                    DatabaseHandler.selected = 3;

                console.log("db: " + db1 + "-" + db2 + "-" + db3);

                DatabaseHandler.checkDBState(DatabaseHandler.selected, true);


                for (var i = 1; i < databases.length; i++) {
                    if (i !== DatabaseHandler.selected)
                        DatabaseHandler.checkDBState(i, false);
                }

                callback(DatabaseHandler.selected);

            })
            .catch(function (error) {
                console.log(error);
                //callback(null);
            });
    }

}

export { DatabaseHandler, auth, databases };