import React, { useState } from "react";
import {
  onSnapshot,
  collection,
  db,
  query,
  orderBy,
} from "../../utils/firebase";

const ExpensesAdminManageUsers = () => {
  //save purchase history
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  // collection ref
  const colRef = collection(db, "purchaseHistory");
  // queries
  const q = query(colRef, orderBy("createdAt"));

  // realtime collection data
  onSnapshot(q, (snapshot) => {
    let history = [];
    snapshot.docs.forEach((doc) => {
      history.push({ ...doc.data(), id: doc.id });
    });
    setPurchaseHistory(history);
  });

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        {/* //purchase history */}
        <section></section>
      </div>
    </div>
  );
};

export default ExpensesAdminManageUsers;
