import React, { useEffect, useState } from "react";
import DatePick from "../../components/date/dateTime";

import Modal from "../../components/Modal/Modal";
import {
  onSnapshot,
  collection,
  db,
  query,
  updateDoc,
  doc,
  increment,
  where,
  orderBy,
} from "../../utils/firebase";

const ExpensesAdminCashReturns = () => {
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 2);
  date.setUTCHours(18);
  date.setUTCMinutes(30);
  const [disable, setDisabled] = useState(false);

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());

  //save purchase history
  const [Amount, setAmount] = useState();
  //save return History
  const [returnHistory, setReturnHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
  console.log(userLogged);
  useEffect(() => {
    // collection ref
    const returnRef = collection(db, "returnHistory");
    // queries

    let Restart = new Date(Start);
    let Reend = new Date(End);
    const q = query(returnRef,
      where("returnTo" , "==" , userLogged.name),
      where("trasnferredDate", ">", Restart),
      where("trasnferredDate", "<", Reend),
      orderBy("trasnferredDate", "desc")
    );

    // realtime collection data
    onSnapshot(q, (snapshot) => {
      let history = [];
      snapshot.docs.forEach((doc) => {
        history.push({ ...doc.data(), id: doc.id });
      });
      setReturnHistory(history);
    });
    // console.log(history);
  }, [onSnapshot, Start, End]);

  // Filter Search
  const filteredData = returnHistory.filter((item) => {
    if (returnHistory.length >= 0) {
      return item.returnedFrom.toLowerCase().includes(search.toLowerCase());
    }
  });
  console.log(filteredData)
  const handleCashReturns = async (data) => {
    setDisabled(true)
    console.log(data);
    setShowModal(true);
    setAmount(data.rAmount)
    await updateDoc(doc(db, "returnHistory", data.id), {
      received: "true",
      reason: "refunded Amount",
      // Balance: 

    })
      .then(
        async () =>
          await updateDoc(doc(db, "users", userLogged.uid), {
            current_balance: increment(Number(data.rAmount)),
          })
      )
      .then(
        async () =>
          await updateDoc(doc(db, "users", data.returneduser), {
            current_balance: increment(-Number(data.rAmount)),
          
          })
      );
      // Closes all data and saves balanceSheet

    setShowModal(false);
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        
         
            <DatePick label={"From"} select={Start} changed={(date) => setStart(date)} />
        
            <DatePick label={"To"} select={End} changed={(date) => setEnd(date)} />
         
        <div className="py-4 ">
          <input
            className="bg-white p-2 w-60 focus:ring-violet-300"
            autoFocus
            type="search"
            placeholder="Search by name, number, etc ..."
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>
        {/* //purchase history */}
        <section>
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Cash Returns
          </h3>
          <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
            <thead className="text-white">
              {filteredData.length > 0 &&
                filteredData.map((r) => (
                  <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Cleared? </th>
                    <th className="p-3 text-left">Clear </th>
                  </tr>
                ))}
            </thead>
            <tbody className="flex-1 sm:flex-none border-2">
              {filteredData.length > 0 ? (
                filteredData.map((data, index) => (
                  <tr
                    className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white border-2 border-white-600"
                    key={index}
                  >
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {index + 1}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {data.returnedFrom}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3">
                      {data.rAmount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {data.trasnferredDate.toDate().toDateString()}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {data.received === "true" ? "Yes" : "No"}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {data.received === "true" ? (
                        <button
                          className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-2 border-blue-700 hover:border-blue-500 rounded"
                          disabled
                        >
                          Cleared
                        </button>
                      ) : (
                        <button
                        disabled={disable}
                          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-2 border-blue-700 hover:border-blue-500 rounded"
                          onClick={() => handleCashReturns(data)}
                        >
                          Clear
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <dd className="w-full">loading</dd>
              )}
            </tbody>
          </table>
        </section>
        <Modal process={`${Amount} has been accepted`} showModal={showModal} setShowModal={setShowModal} />
      </div>
    </div>
  );
};

export default ExpensesAdminCashReturns;
