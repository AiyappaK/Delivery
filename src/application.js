import React, { useContext } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./utils/firebase";
//import pages
import Login from "./pages/login";
// import UserScreen from "./pages/userScreen";

// import components
// import Footer from "../components/footer";
import Navbars from "./components/navbar";
import PurchasePage from "./pages/purchasePage.js";
import PurchaseHistory from "./pages/purchaseHistory";
import ExpensesAdmin from "./pages/ExpensesAdmin";
import ExpensesAdminHistory from "./pages/ExpensesAdmin/ExpensesAdminHistory";
import Register from "./pages/register";
import Error404 from "./pages/404/error404";

import ExpensesAdminCashReturns from "./pages/ExpensesAdmin/ExpensesAdminCashReturns";
import TransactionHistory from "./pages/transactionHistory";
import Transaction from "./pages/cash/cashTransaction";
import Purchase from "./pages/purchase/purchase";
import Expense from "./pages/expense/expense";
import AdminBalancesheet from "./pages/ExpensesAdmin/AdminBalanceSheet";
import Purchasexpense from "./pages/userHistory/purchasehistory";
import Moneytransfer from "./pages/superadmin/moneyTransfer";
import Addmoney from "./pages/superadmin/addMoney";
import DeliveyPage from "./pages/delivery/delivery";
import Payments from "./pages/superadmin/payments";
import SuperExpense from "./pages/superadmin/expense";
import Settlement from "./pages/superadmin/settlement";
import Daybook from "./pages/superadmin/daybook";
import Deliveryreport from "./pages/delivery/deliveryreport";
import Totaltransaction from "./pages/superadmin/history";
import Supertransaction from "./pages/superadmin/transaction";
import Expensesdeliveryhistory from "./pages/ExpensesAdmin/ExpenseDeliveryHistory";
import Transactionhistory from "./pages/ExpensesAdmin/Transactionadmin";
import Retun from "./pages/Cashtransfer/return";
import Cashreturns from "./pages/superadmin/CashReturns";
// import Admin from "../components/Admin/admin"

export default function Application(props) {
  return (
    <>
      <Navbars />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/expenses-user/purchase"
          element={
            <PrivateRoute role="purchase_agent">
              <PurchasePage />
            </PrivateRoute>
          }
        />
      
        <Route
          path="/expenses-user/purchasesummary"
          element={
            <PrivateRoute role="purchase_agent">
              <Purchase />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-user/expense"
          element={
            <PrivateRoute role="purchase_agent">
              <Expense />
            </PrivateRoute>
          }
        />
        {/* <Route path="/" element={<PurchasePage />} /> */}
        <Route
          path="/expenses-user/purchase-history"
          element={
            <PrivateRoute role="purchase_agent">
              <PurchaseHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-user/delivery-history"
          element={
            <PrivateRoute role="purchase_agent">
              <Deliveryreport />
            </PrivateRoute>
          }
        />

        <Route
          path="/expenses-user/transaction-history"
          element={
            <PrivateRoute role="purchase_agent">
              <TransactionHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-user/cash-transaction"
          element={
            <PrivateRoute role="purchase_agent">
              <Transaction />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-user/history"
          element={
            <PrivateRoute role="purchase_agent">
              <Purchasexpense />
            </PrivateRoute>
          }
        />
        <Route 
          path="/expenses-user/delivery" 
          element={
            <PrivateRoute role="purchase_agent">
                  <DeliveyPage />
          </PrivateRoute>
          } />
          <Route 
          path="/expenses-user/return" 
          element={
            <PrivateRoute role="purchase_agent">
                  <Retun />
          </PrivateRoute>
          } />
          //purchase_admin
      <Route
          path="/expenses-admin/Transaction"
          element={
            <PrivateRoute role="purchase_admin">
              <Transactionhistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-admin"
          element={
            <PrivateRoute role="purchase_admin">
              <ExpensesAdmin />
            </PrivateRoute>
          }
        />
        <Route 
          path="/expenses-admin/delivery" 
          element={
            <PrivateRoute role="purchase_admin">
                  <DeliveyPage />
          </PrivateRoute>
          } />
        <Route
          path="/expenses-balancesheet"
          element={
            <PrivateRoute role="purchase_admin">
              <AdminBalancesheet />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-purchase"
          element={
            <PrivateRoute role="purchase_admin">
              <PurchasePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-admin/history"
          element={
            <PrivateRoute role="purchase_admin">
              <ExpensesAdminHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-admin/deliveryreport"
          element={
            <PrivateRoute role="purchase_admin">
              <Expensesdeliveryhistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses-admin/cash-returns"
          element={
            <PrivateRoute role="purchase_admin">
              <ExpensesAdminCashReturns />
            </PrivateRoute>
          }
        />
        //superadmin Accounts
        <Route  path="/expenses-super/cash-returns" 
          element={
            <PrivateRoute role="Super_admin">
             
                  <Cashreturns />
            </PrivateRoute>
          }
          
        />
        <Route  path="/expenses-super/money-transfer" 
          element={
            <PrivateRoute role="Super_admin">
             
                  <Moneytransfer />
            </PrivateRoute>
          }
          
        />
        <Route 
        path="/expenses-super/add-money" 
            element={
              <PrivateRoute role="Super_admin">
            <Addmoney/>
            </PrivateRoute>
            } 
            />
        <Route path="/expenses-super/payments" 
        element={
        <PrivateRoute role="Super_admin">
        <Payments/>
        </PrivateRoute>
      }/>
        <Route path="/expenses-super/expense" 
        element={
        <PrivateRoute role="Super_admin">
        <SuperExpense />
        </PrivateRoute>
        } />

        <Route path="/expenses-super/settlement" 
        element={ 
        <PrivateRoute role="Super_admin">
          <Settlement />
          </PrivateRoute>
        } 
          />
        <Route path="/expenses-super/transaction" 
        element={
        <PrivateRoute role="Super_admin">
        <Totaltransaction />
        </PrivateRoute>

        } 
        />
        <Route path="/expenses-super/daybook" 
        element={
          <PrivateRoute role="Super_admin">
          <Daybook />
        </PrivateRoute>
          } />

        <Route path="/register" element={
         
              <Register />
        
        } />
        <Route path="/expenses-super/history" element={
          <PrivateRoute role="Super_admin">
              <Supertransaction/>
        </PrivateRoute>
        } />
        <Route path="*" element={<Error404 />} />
        {/* <Route exact path="*" component={NotfoundPage} /> */} */
      </Routes>
      {/* <Footer /> 
        cleared - loading state
        user - clear amount should not excced 0 and more than balance
      */}
    </>
  );
}

export const PrivateRoute = (props) => {
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
  const [user, loading, error] = useAuthState(auth);

  let location = useLocation();

  if (loading) {
    return <p className="container">Checking authentication..</p>;
  }

  // const matchedUser = userLogged.filter(user => {

  const userHasRequiredRole = props.role === userLogged.role ? true : false;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  if (user && !userHasRequiredRole) {
    return <Navigate to="*" />; // build your won access denied page (sth like 404)
  }

  if (props.role === userLogged.role) return props.children;
};
