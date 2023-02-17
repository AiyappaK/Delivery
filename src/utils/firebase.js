import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getStorage,ref,uploadBytesResumable,
  getDownloadURL  } from "firebase/storage";
import {
  getFirestore,
  onSnapshot,
  collection,
  serverTimestamp,
  doc,
  where,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  increment,
  
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASyRnB_BhD9DZRBfi9yrV_fkZx9HUf_O0",
  authDomain: "catmart-chinnappa-2022.firebaseapp.com",
  projectId: "catmart-chinnappa-2022",
  storageBucket: "catmart-chinnappa-2022.appspot.com",
  messagingSenderId: "628254519727",
  appId: "1:628254519727:web:77aed614391303ef66bf5a"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// collection ref
// const userRef = collection(db, "users");

const logInWithEmailAndPassword = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

const registerWithEmailAndPassword = async (name, email, password , role) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      current_balance: 0,
      
      name: name,
      
      role: role,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
  }
};
const storage = getStorage(app);

const logout = () => {
  signOut(auth).then(() => localStorage.clear());
};

export {
  storage,
  auth,
  db,
  uploadBytesResumable,
    getDownloadURL ,
  logInWithEmailAndPassword,
  signInWithEmailAndPassword,
  registerWithEmailAndPassword,
  logout,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  where,
  query,
  onSnapshot,
  collection,
  serverTimestamp,
  increment,
  ref,
};
