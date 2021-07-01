import firebase from './firebase-config';

let database = null;
let userKey = null;
let roomUsername = null;

export const joinRoom = async (roomId, username) => {
    try {
      // save username to `firebase.js` file for reference
      roomUsername = username;
  
      // get reference to room
      database = firebase.database().ref(`/rooms/${roomId}`);
  
      // push user into room and create presence
      const user = await database.push({ username });
      // get user key that Firebase generates and save it to global variable
      userKey = user.path.pieces_.pop();
  
      // remove user from room if they leave the application
      database.child(`/${userKey}`).onDisconnect().remove();
  
      return true;
    } catch (err) {
      console.log(err);
    }
};

