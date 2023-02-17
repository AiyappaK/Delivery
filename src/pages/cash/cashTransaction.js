import React, { useEffect, useState } from "react";
import DatePick from "../../components/date/dateTime";
import { LoggedInUserContext } from "../../provider/logged_in_user_provider";
import {
  onSnapshot,
  collection,
  db,
  query,
  where,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
  orderBy,
} from "../../utils/firebase";

const Transaction = () => {
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 5);
  date.setUTCHours(18);
  date.setUTCMinutes(30);
  const [search, setSearch] = useState("");

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());
  const [transactionHistory, settransactionHistory] = useState([]);
  const [totalCash, setTotalCash] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  // realtime collection data
  useEffect(() => {
    let start = new Date(Start);
    let end = new Date(End);
    let Restart = new Date(Start);
    let Reend = new Date(End);
    // queries
    const q = query(
      collection(db, "transationHistory"),
      where("to", "==", userLogged.uid),
      orderBy("trasnferredDate", "desc"),
      where("trasnferredDate", ">=", start),
      where("trasnferredDate", "<=", end)
    );
    const qq = query(
      collection(db, "returnHistory"),
      where("returneduser", "==", userLogged.uid),
      where("trasnferredDate", ">" , Restart),
      where("trasnferredDate", "<" , Reend),
      orderBy("trasnferredDate", "desc"),
    );
    let history = [];

    onSnapshot(qq, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        // console.log(doc.data());
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
    });

    onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
     history.sort((a,b)=>{
        return new Date(b.trasnferredDate.toDate().toDateString()) - new Date(a.trasnferredDate.toDate().toDateString())
      })
      // console.log(history);
      settransactionHistory(history);
    });

  }, [onSnapshot, Start, End]);

  console.log(transactionHistory)

  useEffect(()=>{
    console.log(transactionHistory);
    setTotalCash(0)
    let calculatedPaymentArray = [];
    transactionHistory.map((item) => {
      let cash = [];
      let credit = [];
      if (item.cleared || item.received === "true") {
        if (item.rAmount) {
          credit.push(item.rAmount);
        } else if (item.amount) {
          cash.push(item.amount);
        }
        calculatedPaymentArray.push({
          credit: credit.reduce((acc, selectedItem) => acc + selectedItem, 0),
          cash: cash.reduce((acc, selectedItem) => acc + selectedItem, 0),
         
        });
        let totalCashAmount = [];
        let totalCreditAmount = [];
        calculatedPaymentArray.map(
          (item, i) => (
            totalCashAmount.push(Number(item.cash)),
            totalCreditAmount.push(Number(item.credit))
          )
        );
        setTotalCash(totalCashAmount.reduce((acc, item) => acc + item, 0));
        setTotalCredit(totalCreditAmount.reduce((acc, item) => acc + item, 0));
      }
    })
    
  },[transactionHistory])
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
      <div className="flex flex-row py-2">
      <div className="px-4">
      <div className=" w-32 border-solid border-2 border-indigo-600 rounded font-medium ">
          <h6>Total Received  </h6>
          <h3>
           {totalCash}
            &nbsp; INR
          </h3>
          </div>
          </div>
          <div className="px-4">
          <div className=" w-32 border-solid border-2 border-indigo-600 rounded font-medium ">
          <h6>Total Amount </h6>
          <h3>
           {totalCredit}
            &nbsp; INR
          </h3>
          </div>
          </div>
      </div>    
        <div className="flex flex-col items-center ">
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Transaction History
          </h3>

          <DatePick label={"From"}
 select={Start} changed={(date) => setStart(date)} />
        <DatePick label = {"To"} select={End} changed={(date) => setEnd(date)} />
          <section>
          <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5 ">
              <thead className="text-white">
                {transactionHistory.length > 0 &&
                  transactionHistory.map((r) => (
                    <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Cr Amount</th>
                      <th className="p-3 text-left">Dr Amount</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">status </th>
                      <th className="p-3 text-left">received </th>
                    </tr>
                  ))}
              </thead>
              <tbody className="flex-1 sm:flex-none ">
                {transactionHistory.length > 0 ? (
                  transactionHistory.map((data, index) => (
                    <tr
                      className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white border-2 border-white-600"
                      key={index}
                    >
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {index + 1}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3">
                        {data.amount ? data.amount: "NA"}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.rAmount ? data.rAmount: "NA"}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.trasnferredDate.toDate().toDateString()}
                      </td>
                     
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.received ? null : data.cleared ? "Accepted" : "Not Accepted"}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.received ? null : data.cleared ? (
                          <button
                            className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                            disabled
                          >
                            Accepted
                          </button>
                        ) : (
                          <button
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                            
                          >
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <dd className="w-full">loading...</dd>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};
export default Transaction;
