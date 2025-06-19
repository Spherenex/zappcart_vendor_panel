import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA5ReIwel6soo1uIWWRvAIdIubZQKnbjfc",
  authDomain: "zappcart-control-panel.firebaseapp.com",
  databaseURL: "https://zappcart-control-panel-default-rtdb.firebaseio.com",
  projectId: "zappcart-control-panel",
  storageBucket: "zappcart-control-panel.firebasestorage.app",
  messagingSenderId: "553907813502",
  appId: "1:553907813502:web:a02da34d9d47af8c0cac2f",
  measurementId: "G-G1HDHNE57E"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth, app };