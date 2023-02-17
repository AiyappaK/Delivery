import React, { useState, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "../../utils/firebase";

import { logout } from "../../utils/firebase";

// import library
import { NavLink, useNavigate } from "react-router-dom";

import { LoggedInUserContext } from "./../../provider/logged_in_user_provider";

const Navbar = () => {
  const navigate = useNavigate();

  const [toggleButton, setToggleButton] = useState(false);
  const [user, loading, error] = useAuthState(auth);
  const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);

  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  return (
    <nav className="bg-white py-2 md:py-4">
      <div className="container px-4 mx-auto md:flex md:items-center">
        <div className="flex justify-between items-center">
          <a href="#" className="font-bold text-xl text-indigo-600">
            CAT MART
          </a>

          <button
            className="border border-solid border-gray-600 px-3 py-1 rounded text-gray-600 opacity-50 hover:opacity-75 md:hidden"
            id="navbar-toggle"
            onClick={() => setToggleButton(!toggleButton)}
          >
            <i className="fas fa-hamburger"></i>
          </button>
        </div>
        <span> {toggleButton}</span>
        <div
          className={`${toggleButton ? "flex" : "hidden"
            } flex-col  md:flex  md:flex-row md:ml-auto mt-3 md:mt-0 "`}
          id="navbar-collapse"
        >
          {userLogged?.role === "purchase_admin" && (
            <>
              <NavLink to="/">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Home
                </div>
              </NavLink>
              <NavLink to="/expenses-admin/delivery">
                <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                  Delivery
                </li>
              </NavLink>
              <NavLink to="/expenses-purchase">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Purchase
                </div>
              </NavLink>
              <NavLink to="/expenses-admin/history">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  History
                </div>
              </NavLink>
              <NavLink to="/expenses-admin/deliveryreport">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Delivery Report
                </div>
              </NavLink>
              <NavLink to="/expenses-admin/cash-returns">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Cash returns
                </div>
              </NavLink>
              <NavLink to="/expenses-balancesheet">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Balance Sheet
                </div>
              </NavLink>
              
              <NavLink to="/expenses-admin/Transaction">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Transaction
                </div>
              </NavLink>
            </>
          )}

          {userLogged?.role === "purchase_agent" && (
            <>
              <NavLink to="/">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Cash
                </div>
              </NavLink>
              <NavLink to="/expenses-user/purchase">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Purchase
                </div>
              </NavLink>
              
              <NavLink to="/expenses-user/delivery">
                <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                  Delivery
                </li>
              </NavLink>
              <NavLink to="/expenses-user/return">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Return
                </div>
              </NavLink>

              <NavLink to="/expenses-user/history">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  History
                </div>
              </NavLink>
              
              <div className="group p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600 ">
                <div className="inline-flex items-center px-1">
                  <span className="px-2">Summary</span>
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
                <ul className="absolute hidden text-gray-700 pt-1 group-hover:block">
                  <NavLink to="/expenses-user/purchase-history">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                      Balance Sheet
                    </li>

                  </NavLink>
                  <NavLink to="/expenses-user/cash-transaction">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                      Cash
                    </li>
                  </NavLink>
                  <NavLink to="/expenses-user/purchasesummary">
                    <li className="bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                      Purchase
                    </li>
                  </NavLink>

                  <NavLink to="/expenses-user/expense">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                      Expense
                    </li>
                  </NavLink>
                  <NavLink to="/expenses-user/delivery-history">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                      Delivery
                    </li>
                  </NavLink>
                </ul>
              </div>
            </>
          )}
          {userLogged?.role === "Super_admin" && (
            <>
              <NavLink to="/">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Transfer
                </div>
              </NavLink>
              <NavLink to="/expenses-super/add-money">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                  Add Money
                </div>
              </NavLink>
              <NavLink to="/expenses-super/payments">
                <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                  Payments
                </li>
              </NavLink>
              <NavLink to="/expenses-super/expense">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                Expense
                </div>
              </NavLink>
              <NavLink to="/expenses-super/cash-returns">
                <div className="p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600">
                Return
                </div>
              </NavLink>

              <div className="group p-2 lg:px-4 md:mx-2 text-white rounded bg-indigo-600 ">
                <div className="inline-flex items-center px-1">
                  <span className="px-2">Summary</span>
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
                <ul className="absolute hidden text-gray-700 pt-1 group-hover:block">
                  <NavLink to="/expenses-super/settlement">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                    Settlement
                    </li>

                  </NavLink>
                  <NavLink to="/expenses-super/daybook">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                      Daybook
                    </li>
                  </NavLink>
                  <NavLink to="/expenses-super/transaction">
                    <li className="bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                    Totaltransaction
                    </li>
                  </NavLink>

                  <NavLink to="/register">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                    Register
                    </li>
                  </NavLink>
                  <NavLink to="/expenses-super/history">
                    <li className="rounded-b bg-indigo-600  text-white hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap">
                    History
                    </li>
                  </NavLink>
                </ul>
              </div>
            </>
          )}
          {!!user ? (
            <NavLink to="/">
              <button
                className="p-2 lg:px-4 md:mx-2 text-indigo-600 text-center border border-solid border-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1"
                onClick={() => {
                  logout();
                  localStorage.removeItem("loggedInUser");
                  navigate("/");
                }}
              >
                Logout
              </button>
            </NavLink>
          ) : (
            <NavLink to="/">
              <button className="p-2 lg:px-4 md:mx-2 text-indigo-600 text-center border border-solid border-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1">
                Login
              </button>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
