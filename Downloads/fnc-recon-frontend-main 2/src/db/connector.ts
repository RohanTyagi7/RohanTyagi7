import { initializeApp } from "firebase/app"
import { getFirestore, getDocs, collection, doc, setDoc, getCountFromServer } from "firebase/firestore"
import { ScoreData } from "views/Scout/ScoutForm"
import { v4 as uuidv4 } from 'uuid'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "fnc-united.firebaseapp.com",
  projectId: "fnc-united",
  storageBucket: "fnc-united.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASURE_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

let endpoint: string
if (process.env.REACT_APP_ENVIRONMENT === 'local') {
  endpoint = 'fnc-united-db-dev'
} else {
  endpoint = ''
}

type NewReport = {
  reporting_team: string,
  alliance: string,
  event: string,
  match: string,
  scouted_team: string,
} | ScoreData

export const testDB = async () => {
  console.log("Connecting to DB")
  let snapshot = await getCountFromServer(collection(db, 'fnc-united-db-dev'))
  console.log(`${snapshot.data().count} entries found`)
}

export const addReport = async (value: NewReport) => {
  try {
    await setDoc(doc(db, endpoint, uuidv4()), value)
  } catch (e) {
    console.error(e)
  }
}