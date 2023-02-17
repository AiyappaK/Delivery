import React from "react";
import {
  auth,
  onSnapshot,
  collection,
  db,
  query,
  where,
} from "./utils/firebase";
//import library
import { BrowserRouter as Router } from "react-router-dom";
//import component
import Application from "./application";
import { useAuthState } from "react-firebase-hooks/auth";

function App() {
  const { user } = useAuthState(auth);

  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));


  // const q = user && query(collection(db, "users"), where("uid", "==",userLogged.uid  )) ;
  // const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //   const userInfo = [];
  //   querySnapshot.forEach((doc) => {
  //     userInfo.push(doc.data());
  //   });
  //   localStorage.setItem("loggedInUser", JSON.stringify(userInfo));
  // });

  
  return (
    <Router>
      <Application />
    </Router>
  );
}

export default App;


