import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

/**
 * access data for the firebase database
 */

const firebaseConfig = {
  apiKey: "AIzaSyDh-aEotv6wpmoZqEkV_qxG9ktHRdKdMQE",
  authDomain: "einkaufsapp-asab.firebaseapp.com",
  projectId: "einkaufsapp-asab",
  storageBucket: "einkaufsapp-asab.appspot.com",
  messagingSenderId: "702883246511",
  appId: "1:702883246511:web:3b1bc12e9902e271cebf5a",
  measurementId: "G-GPNLQC51SX"
}

const app = firebase.initializeApp(firebaseConfig)

/**
 * model to store and read data in "firestore authentication"
 */
export const auth = app.auth()

/**
 * model to store and read data in "firestore database"
 */
export const firestore = app.firestore()

/**
 * model to store and read data in "firestore storage"
 */
export const storage = app.storage()