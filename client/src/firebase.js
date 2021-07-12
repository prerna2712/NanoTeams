import firebase from "firebase/app"
import "firebase/auth"

const app = firebase.initializeApp({
    apiKey: "AIzaSyBNUbcDCW5z4zK_iDVvKe2Ck_FVtIDnu-Y",
    authDomain: "nano-teams.firebaseapp.com",
    projectId: "nano-teams",
    storageBucket: "nano-teams.appspot.com",
    messagingSenderId: "1041776053965",
    appId: "1:1041776053965:web:14f0b7fb4fedc44523a384",
    measurementId: "G-MZWCRZNZJC"
})

export const auth = app.auth()
export default app
