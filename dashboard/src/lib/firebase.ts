import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'rappit-48h.firebaseapp.com',
  projectId: 'rappit-48h',
  storageBucket: 'rappit-48h.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Cloud Functions base URL
export const FUNCTIONS_BASE_URL = import.meta.env.PROD
  ? 'https://asia-northeast1-rappit-48h.cloudfunctions.net'
  : 'http://127.0.0.1:5001/rappit-48h/asia-northeast1'
