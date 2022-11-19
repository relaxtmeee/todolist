
import { initializeApp } from "firebase/app";
import { getAnalytics} from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBDD6SMriTL6kesX8Adtj2vcPHFpauEg6c",
  authDomain: "todo-5808f.firebaseapp.com",
  projectId: "todo-5808f",
  messagingSenderId: "1046523678434",
  appId: "1:1046523678434:web:bcb81c7c998f19fe3658bb",
  measurementId: "G-WSPBZ4GWB0",
  storageBucket: 'gs://todo-5808f.appspot.com'
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const db = getFirestore(app);

export const storage = getStorage(app);
