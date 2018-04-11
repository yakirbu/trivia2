/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const cors = require('cors');
const express = require('express');

const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// [END import]

// [START addMessage]
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
// [START addMessageTrigger]

/*
exports.addMessage = functions.https.onRequest((req, res) => {
// [END addMessageTrigger]
  // Grab the text parameter.
  const original = req.query.text;
  // [START adminSdkPush]
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
  });
  // [END adminSdkPush]
});
// [END addMessage]
*/

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercas
var masterdb = admin.database();
let fapp = admin.app();
var database1 = fapp.database("https://12questions-db1.firebaseio.com/");
var database2 = fapp.database("https://12questions-db2.firebaseio.com/");
var database3 = fapp.database("https://12questions-db3.firebaseio.com/");
var databases = [masterdb, database1, database2, database3];

/*
exports.onDisconnect = functions.database.ref('/Disconnect')
  .onCreate((snapshot, context) => {
    times++;
    console.log("times: " + times);
    var gameId = "";
    snapshot.forEach(snap => {
      gameId = snap.val();
      console.log("im-here");
      console.log(gameId);
    });

    var postRef = database.ref('/GameStats/' + gameId);
    return postRef.transaction((post) => {
      if (post) {
        if (post.playingUsers && post.playingUsers > 0) {
          post.playingUsers--;
        }
      }
      if (post !== undefined) {
        return post;
      }
      else
        throw post;
    }).then(result => {
      return snapshot.ref.remove();
    });





  });
  */



/*
databases[0].ref('Disconnect').on("child_added", (snapshot, prevChildKey) => {
  var value = snapshot.val();
  var strSplit = value.split("-");
  var gameId = strSplit[1];
  var selectedDatabase = strSplit[0];

  databases[0].ref('/Databases/').transaction((snapData) => {
    if (snapData) {
      if (snapData["db" + selectedDatabase] > 0) {
        snapData["db" + selectedDatabase]--;
      }
    }
    return snapData;
  }).then(() => {
    return snapshot.ref.remove();
  }).catch(e => {
    console.log(e);
  });

});
*/



databases.forEach(db => {
  //DISCONNECT
  db.ref('Disconnect').on("child_added", (snapshot, prevChildKey) => {
    var value = snapshot.val();
    var strSplit = value.split("-");
    var gameId = strSplit[1];
    var selectedDatabase = strSplit[0];

    databases[0].ref('/Databases/').transaction((snapData) => {
      if (snapData) {
        if (snapData["db" + selectedDatabase] > 0) {
          snapData["db" + selectedDatabase]--;
        }
      }
      return snapData;
    }).then(() => {
      return snapshot.ref.remove();
    }).catch(e => {
      console.log(e);
    });

  });

  //CONNECT
  db.ref('Connect').on("child_added", (snapshot, prevChildKey) => {
    var value = snapshot.val();
    var strSplit = value.split("-");
    var gameId = strSplit[1];
    var selectedDatabase = strSplit[0];

    databases[0].ref('/Databases/').transaction((snapData) => {
      if (snapData) {
        snapData["db" + selectedDatabase]++;
      }
      return snapData;
    }).then(() => {
      return snapshot.ref.remove();
    }).catch(e => {
      console.log(e);
    });

  });
});



//FIREBASE CHANGES =============================================
var currentGame = "";

//General CHANGES
var generalRef = databases[0].ref('General');
generalRef.on("child_changed", function (snapshot) {
  var changed = snapshot.val();
  databases.forEach(db => {
    if (db === databases[0])
      return;
    db.ref('General').child(snapshot.key).set(changed);
  });
});


//Games CHANGES
var gamesRef = databases[0].ref('Games');
gamesRef.on("child_changed", function (snapshot) {
  var changed = snapshot.val();
  databases.forEach(db => {
    if (db === databases[0])
      return;
    db.ref('Games').child(snapshot.key).set(changed);
  });
});


//Questions CHANGES
var questionsRef = databases[0].ref('Questions');
questionsRef.on("child_changed", function (snapshot) {
  var changed = snapshot.val();
  databases.forEach(db => {
    if (db === databases[0])
      return;
    db.ref('Questions').child(snapshot.key).set(changed);
  });
});


//QuestionData CHANGES
databases.forEach(dbM => {
  var questionDataRef = dbM.ref('QuestionData');
  questionDataRef.on("child_changed", function (snapshot) {
    var changed = snapshot.val();
    databases.forEach(db => {
      if (db === dbM)
        return;
      db.ref('QuestionData').child(snapshot.key).set(changed);
    });
  });
});


//UserAns CHANGES
databases.forEach(dbM => {
  var userAnsRef = dbM.ref('UserAns');
  userAnsRef.on("child_changed", function (snapshot) {
    var changed = snapshot.val();
    databases.forEach(db => {
      if (db === dbM)
        return;
      db.ref('UserAns').child(snapshot.key).set(changed);
    });
  });
});

//Users CHANGES
databases.forEach(dbM => {
  var usersRef = dbM.ref('Users');
  usersRef.on("child_changed", function (snapshot) {
    var changed = snapshot.val();
    databases.forEach(db => {
      if (db === dbM)
        return;
      db.ref('Users').child(snapshot.key).set(changed);
    });
  });
});




/*
listenToGameChanges();
function listenToGameChanges() {
  generalRef.once("value", (snapshot) => {
    if (currentGame !== "") {
      var oldGamesRef = databases[0].ref('Games/' + currentGame);
      oldGamesRef.off();
    }

    currentGame = snapshot.val().currentGame;
    var gamesRef = databases[0].ref('Games/' + currentGame);

    gamesRef.on("child_changed", function (snapshot) {
      var changed = snapshot.val();
      databases.forEach(db => {
        db.ref('Games/' + currentGame).child(snapshot.key).set(changed);
      });
    });
  });
}
*/



// [END makeUppercase]




const app = express();
app.use(cors());
app.get('/api/time', (request, response) => {
  response.send(`${Date.now()}`);
});
exports.app = functions.https.onRequest(app);



// [END all]




