import React, { useState, useContext, useEffect } from "react";
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

const TransactionHistory = () => {
  const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
  //save purchase history
  const [transactionHistory, settransactionHistory] = useState([]); 
  const [UserBalance, setUserBalance] = useState([]);
  const [disable, setDisabled] = useState(false);
  const [totalCredit, setTotalCredit] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [error, setError] = useState("");
  
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 1);
  date.setUTCHours(18);
  date.setUTCMinutes(30);

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());
  
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  // realtime collection data
  useEffect(() => {
    let start = new Date(Start);
    let end = new Date(End);
    let Restart = new Date(Start);
    let Reend = new Date(End);
    
    // queries
    
    const qR = query(
      collection(db, "returnHistory"),
      where("returneduser", "==", userLogged.uid),
      where("trasnferredDate", ">" , Restart),
      where("trasnferredDate", "<" , Reend),
      orderBy("trasnferredDate", "desc"),
      
    );
    const qT = query(
      collection(db, "transationHistory"),
      where("to", "==", userLogged.uid),
      orderBy("trasnferredDate", "desc"),
      where("trasnferredDate", ">" , start),
      where("trasnferredDate", "<" , end),
    );
    const qU = query(
      collection(db, "users"),
      where("uid", "==", userLogged.uid)
    );
    onSnapshot(qU, (snapshot) => {
      // let history = [];
      snapshot.docs.forEach((doc) => {
        setUserBalance(doc.data());
      });
    });
    
    let history = []; // stores both transaction and return 
    

    onSnapshot(qR, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        // console.log(doc.data());
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
    });

    onSnapshot(qT, (snapshot) => {
      // let history = [];
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      history.sort((a,b)=>{
        return new Date(b.trasnferredDate.toDate().toDateString()) - new Date(a.trasnferredDate.toDate().toDateString())
      })
      settransactionHistory(history);
    });
    
  }, [onSnapshot, Start, End ]);

  // const handleReturn = () => {
  //   if (
  //     returnAmount <= 0 ||
  //     returnAmount === "" ||
  //     UserBalance.current_balance < returnAmount
  //   ) {
  //     return setError("enter correct amount");
  //   }
  //   addDoc(collection(db, "returnHistory"), {
  //     rAmount: returnAmount,
  //     trasnferredDate: serverTimestamp(),
  //     received: "false",
  //     returnedFrom: userLogged.name,
  //     user: userLogged.uid,
  //   });
  // };

  const handleAccept = async (data) => {
    setDisabled(true)
    await updateDoc(doc(db, "transationHistory", data.id), {
      cleared: "true",
    })
    
    .then(async()=>
      await updateDoc(doc(db, "users", userLogged.uid), {
          current_balance:increment((Number(data.amount))),
        }),
    )

    .then(async()=>
    await updateDoc(doc(db, "users", data.userID), {
      current_balance: increment(-(Number(data.amount))),
    }),
  );
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        
        <section className="w-11/12">
          <div className="max-w-3xl  mx-auto ">
            <h3 class="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
              Cash History 
            </h3>
          </div>
          <div className="pricing-plans lg:flex lg:-mx-4 mt-6 md:mt-12 ">
            <div className="pricing-plan-wrap  my-4 md:my-6">
              <div className="pricing-plan border-t-4 border-solid border-white bg-white text-center max-w-sm mx-auto hover:border-indigo-600 transition-colors duration-300">
                <div className="p-6 md:py-8">
                  <h4 className="font-medium leading-tight text-2xl mb-2">
                    Cash
                  </h4>
                </div>
                <div className="pricing-amount bg-indigo-400 p-6  duration-300">
                  <div className>
                    <span className="text-4xl font-semibold">
                      ₹ {UserBalance.current_balance}
                    </span>
                    balance
                  </div>
                </div>
                
              </div>
            </div>
          
          </div>
        </section>
        {/* <section>
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Clear balance
          </h3>
          <div>{error && <h5 className="text-red-400">{error}</h5>}</div>
          <div class="md:flex flex-row">
            <input
              type="number"
              class="form-control block w-full px-4 py-2 mb-2 md:mb-0 md:mr-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none appearance-none "
              placeholder="Enter the amount"
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setReturnAmount(e.target.value)}
            />

            <button
              type="submit"
              class="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
              data-mdb-ripple="true"
              data-mdb-ripple-color="light"
              onClick={() => handleReturn()}
            >
              Return
            </button>
          </div>
        </section> */}
        <div className="flex flex-col items-center ">
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Transaction History
          </h3>
          <section>
            
            <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5 ">
              <thead className="text-white sticky top-0 z-50">
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
                        {data.amount}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.rAmount}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.trasnferredDate.toDate().toDateString()}
                      </td>
                     
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.received ? null : data.cleared ? "Accepted" : "Not Accepted"}
                      </td>
                      <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                        {data.received ? null : data.cleared === "true" ? (
                          <button
                            className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                            disabled
                          >
                            Accepted
                          </button>
                        ) : (
                          <button disabled={disable}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                            onClick={() => handleAccept(data)}
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

export default TransactionHistory;
