import React, { useEffect, useState, useContext } from "react";
import { Navigate, useNavigate, Route, Routes } from "react-router-dom";
import {
  auth,
  doc,
  db,
  getDoc,
  signInWithEmailAndPassword,
} from "../../utils/firebase";
import { LoggedInUserContext } from "./../../provider/logged_in_user_provider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);

  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    userLogged?.role === "purchase_admin"
      ? navigate("/expenses-admin")
      : userLogged?.role === "purchase_agent"
      ? navigate("/expenses-user/transaction-history")
      : userLogged?.role === "Super_admin"
      ? navigate("/expenses-super/money-transfer")
      : navigate("/")
      
  }, [loggedInUser]);

  const handleLogin = async () => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password)
      .then(async (r) => {
        const docRef = doc(db, "users", r.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLoggedInUser(docSnap.data());
          localStorage.setItem("loggedInUser", JSON.stringify(docSnap.data()));
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
    userLogged?.role === "purchase_admin"
      ? navigate("/expenses-admin")
      : userLogged?.role === "purchase_agent"
      ? navigate("/expenses-user/transaction-history")
      : navigate("/");
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <h1>Loading ...</h1>
      ) : (
        <div className="lg:flex min-h-screen  bg-white">
          <div className="lg:w-1/2 xl:max-w-screen-sm">
            <div className="mt-3px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
              <h2
                className="text-center text-4xl text-indigo-900 font-display font-semibold lg:text-left xl:text-5xl
              xl:text-bold"
              >
                Log In
              </h2>
              <div className="m-12">
                <form>
                  <div className="mt-8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-gray-700 tracking-wide">
                        Email
                      </div>
                    </div>
                    <input
                      className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      id="inputPassword"
                      type="text"
                      placeholder="Email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mt-8">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-gray-700 tracking-wide">
                        Password
                      </div>
                    </div>
                    <input
                      className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      id="inputPassword"
                      type="password"
                      placeholder="Password"
                      required
                      maxLength="10"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <h5 className="text-red-400">{error}</h5>}
                  <div className="mt-10">
                    <button
                      className="bg-indigo-500 text-gray-100 py-3 w-full rounded-full tracking-wide
                          font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600
                          shadow-lg"
                      type="button"
                      onClick={(e) => handleLogin()}
                    >
                      Log In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
            <div
              className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  'url("https://img.freepik.com/free-vector/tablet-login-concept-illustration_114360-7963.jpg?t=st=1648372350~exp=1648372950~hmac=de9e23feac00c2adeac99ec32b61100bba6c9693ce1ab46da2f82dbb9afdf09a&w=826")',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
