import React, { useState, useEffect } from "react";
import DatePick from "../../components/date/dateTime";

import {
  query,
  onSnapshot,
  where,
  collection,
  db,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "../../utils/firebase";

const Supertransaction = () => {
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  //save purchase history
  const [agentSelected, setAgentSelected] = useState("");
  const [agents, setAgents] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [totalCash, setTotalCash] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [accountHistory, setAccountHistory] = useState([]);
  const [companyHistory, setCompanyhistory] = useState([]);
  const [amountHistory, setAmountHistory] = useState([]);
  const [disable, setDisabled] = useState(false);



  const [LoggedUserInfo, setLoggedUserInfo] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  
  
  // Time Controls For B2b and B2c
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 1);
  date.setUTCHours(18);
  date.setUTCMinutes(30);

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());
  
  useEffect(() => {
    const tez = async () => {
      const q = query(
        collection(db, "users"),
        where("role", "==", "super_admin")
      );
      onSnapshot(q, (snapshot) => {
        let history =[]
        snapshot.docs.forEach((doc) => {
          history.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        setAgents(history);
      });
      // on Snapshot on admin
      const qU = query(
        collection(db, "users"),
        where("uid", "==", userLogged.uid)
      );
      onSnapshot(qU, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            setLoggedUserInfo(doc.data());
        });
      });
    };
    tez();
  }, []);
  // realtime collection data
  useEffect(() => {
    let start = new Date(Start);
    let end = new Date(End);
  
    // purchase History will be debit
    const companyHistory = query(
      collection(db, "companyHistory"),
      where("AccountantByUserId", "==", userLogged.uid),
      where("trasnferredDate", ">", start),
      where("trasnferredDate", "<", end),
      orderBy("trasnferredDate", "desc")
    );

    const AmountHistory = query(
        collection(db, "AmountHistory"),
        where("AccountantByUserId", "==", userLogged.uid),
        where("trasnferredDate", ">", start),
        where("trasnferredDate", "<", end),
        orderBy("trasnferredDate", "desc")
      );

      
    const accountHistory = query(
        collection(db, "accountHistory"),
        where("AccountantByUserId", "==", userLogged.uid),
        where("trasnferredDate", ">", start),
        where("trasnferredDate", "<", end),
        orderBy("trasnferredDate", "desc")
      );
    

    let history = [];

    onSnapshot(AmountHistory, (snapshot) => {
      let select=[]
      snapshot.docs.forEach((doc) => {          
        history.push({
          ...doc.data(),
          id: doc.id,
        });
        select.push({
          ...doc.data(),
            id:doc.id,
          })
          
          const selected = select.filter((selected) => {
            if (selected.typeOfPayment != "credit") {
              return selected;
            }      
          });
          setAmountHistory(selected)
        });
      });

    onSnapshot(accountHistory, (snapshot) => {
      let select=[]
      snapshot.docs.forEach((doc) => {          
        history.push({
          ...doc.data(),
          id: doc.id,
        });
        select.push({
          ...doc.data(),
            id:doc.id,
          })
          
          const selected = select.filter((selected) => {
            if (selected.typeOfPayment != "credit") {
              return selected;
            }      
          });
          setAccountHistory(selected)
        });
      });

    onSnapshot(companyHistory, (snapshot) => {
      let select=[]
      snapshot.docs.forEach((doc) => {          
        history.push({
          ...doc.data(),
          id: doc.id,
        });
        select.push({
          ...doc.data(),
            id:doc.id,
          })
          
          const selected = select.filter((selected) => {
            if (selected.typeOfPayment != "credit") {
              return selected;
            }      
          });
          setCompanyhistory(selected)
      });

      history.sort((a, b) => {
          return (
            new Date(b.trasnferredDate.toDate().toLocaleString()) -
            new Date(a.trasnferredDate.toDate().toLocaleString())
          );
      });
      setPurchaseHistory(history);
      console.log("xxcz",history); 
    });
  }, [onSnapshot, End, Start]);

  ///aiyappa cash and credit calculation here
  const test = () => {
    let calculatedPaymentArray = [];
    purchaseHistory.map((item) => {
      let cash = [];
      let credit = [];
      let custName = [];
      let custPhone = [];
      let invoiceNumber = [];
      let invoiceDate = [];

      if (!item.cleared) {
        if (item.typeOfPayment === "credit") {
          credit.push(item.amount);
        } else if (item.typeOfPayment === "cash") {
          cash.push(item.amount);
        }
        if (true) {
          // invoiceCreatedBy.push(item.invoiceCreatedBy);
          custName = item.custName;
          custPhone = item.custPhone;
          invoiceNumber.push(item.invoiceNo);
          invoiceDate.push(item.createdAt);
        }

        calculatedPaymentArray.push({
          credit: credit.reduce((acc, selectedItem) => acc + selectedItem, 0),
          cash: cash.reduce((acc, selectedItem) => acc + selectedItem, 0),
          invoiceNumber: invoiceNumber.reduce(
            (acc, selectedItem) => acc + selectedItem
          ),
          // invoiceCreatedBy: invoiceCreatedBy.reduce(
          //   (acc, selectedItem) => acc + selectedItem,
          // ),
          invoiceDate: invoiceDate.reduce(
            (acc, selectedItem) => acc + selectedItem
          ),
          custPhone: custPhone,
          // custAddress: custAddress,
          custName: custName,
        });
        console.log(cash);

        // merge duplicate customers
        let newData = [
          ...new Set(calculatedPaymentArray.map((d) => d.custName)),
        ].map((custName) => {
          return {
            custName,

            custPhone: calculatedPaymentArray
              .filter((d) => d.custName === custName)
              .map((d) => d.custPhone)
              .find((d) => d),
            credit: calculatedPaymentArray
              .filter((d) => d.custName === custName)
              .map((d) => d.credit),
            cash: calculatedPaymentArray
              .filter((d) => d.custName === custName)
              .map((d) => d.cash),

            invoiceNumber: calculatedPaymentArray
              .filter((d) => d.custName === custName)
              .map((d) => d.invoiceNumber),
            invoiceDate: calculatedPaymentArray
              .filter((d) => d.custName === custName)
              .map((d) => d.invoiceDate),
            invoiceCreatedBy: calculatedPaymentArray
              .filter((d) => d.custName === custName)
              .map((d) => d.invoiceCreatedBy),
          };
        });
        // calculate total GST for time range
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
    });
  };
  // const filteredData = purchaseHistory.filter((item) => {
  //   if (purchaseHistory.length >= 0) {
  //     return (
  //       item.purchasedBy.toLowerCase().includes(search.toLowerCase()) ||
  //       item.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
  //       item.typeOfPayment.toLowerCase().includes(search.toLowerCase()) ||
  //       item.typeOfExpenses.toLowerCase().includes(search.toLowerCase()) ||
  //       item.venderName.includes(search)
  //     );
  //   }
  // });

  // const Account = () => {
  //   let balance = balance;

  //   const transactions = []

  //   const getBalance = () => {
  //     return balance
  //   };

  //   const widthdraw = (amount) => {
  //     if(amount > balance) {
  //       console.log('You dont have enough money');
  //       return;
  //     } else {
  //       balance -= amount
  //       transactions.push({ balance: balance })
  //       return balance;
  //     }
  //   }
  //   const deposit = (amount) => {
  //     balance += amount
  //     transactions.push({ balance : balance })
  //     }
  //   }

  useEffect(() => {
    setTotalCash(0);
    setTotalCredit(0);
    let calculatedPaymentArray = [];
    purchaseHistory.map((item) => {
      let debit = [];
      let credit = [];

      if (item.amount) {
        credit.push(item.amount);
      } else if (item.rAmount) {
        debit.push(item.rAmount);
      } else if (item.pAmount) {
        debit.push(item.pAmount);
      }
      calculatedPaymentArray.push({
        credit: credit.reduce((acc, selectedItem) => acc + selectedItem, 0),
        debit: debit.reduce((acc, selectedItem) => acc + selectedItem, 0),
      });
      let totaldebitAmount = [];
      let totalCreditAmount = [];
      calculatedPaymentArray.map(
        (item, i) => (
          totaldebitAmount.push(Number(item.debit)),
          totalCreditAmount.push(Number(item.credit))
        )
      );
      let tCash = totaldebitAmount.reduce((acc, item) => acc + item, 0);
      let tCredit = totalCreditAmount.reduce((acc, item) => acc + item, 0);
      setTotalCash(tCash);
      setTotalCredit(tCredit);
      setTotalBalance(Number(tCredit - tCash));
    });
  }, [purchaseHistory, End, Start]);

  useEffect(()=>{
    purchaseHistory.map((data, i) =>{
      if (data.Cleared === "true") {
        setCleared(true)
      }
      else{
        setCleared(false)
      }
    })
  },[purchaseHistory])
  
  const handleCloseBalance = async () => {
    console.log("clicked");
    setDisabled(true);
    purchaseHistory.sort((a, b) => {
      return (
        new Date(a.trasnferredDate.toDate().toLocaleString()) -
        new Date(b.trasnferredDate.toDate().toLocaleString())
      );
    });

    await addDoc(collection(db, "daybook"), {
      daybook: purchaseHistory,
      generatedDate: serverTimestamp(),
    })
    .then(async () => {
      
      console.log("1purchaseHistory");
      accountHistory.forEach((i) =>
          updateDoc(doc(db, "accountHistory", i.id), {
            Cleared: "true",
          })
        )
      })
      .then( async () => {
        companyHistory.forEach((i) =>
        updateDoc(doc(db, "companyHistory", i.id), {
          Cleared: "true",
        }));
      })
      .then( async () => {
        amountHistory.forEach((i) =>
        updateDoc(doc(db, "AmountHistory", i.id), {
          Cleared: "true",
        }));
      })
      
        console.log("END");
  };
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        <div className="flex flex-row items-center px-5 gap-2">
          <div className=" w-28 justify-items-center  border-solid border-2 border-indigo-600 rounded font-medium ">
            <h6>Credit </h6>
            <h3>
              {totalCredit}
              &nbsp; INR
            </h3>
          </div>
          <div className=" w-28 border-solid border-2 border-indigo-600 rounded font-medium ">
            <h6>Purchase</h6>
            <h3>
              {totalCash}
              &nbsp; INR
            </h3>
          </div>
          <div className=" w-28 border-solid border-2 border-indigo-600 rounded font-medium ">
            <h6>Balance </h6>
            <h3>
              {totalBalance}
              &nbsp; INR
            </h3>
          </div>
        </div>
      
       
            <DatePick label = {"From"} select={Start} changed={(date) => setStart(date)} />
         
            <DatePick label = {"To"}select={End} changed={(date) => setEnd(date)} />
          
          {/* <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => handleCloseBalance()}
          >
            Close My DayBook
          </button> */}
        {/* </div> */}
        {/* <h5>Search</h5>
        <input
          className="bg-white p-2 w-3/4 outline-none"
          autoFocus
          type="search"
          placeholder="Search by name, number, etc ..."
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        /> */}
        <section>
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Balance Sheet
          </h3>

          <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg hidden overflow-hidden sm:shadow-lg my-5">
            <thead className="text-white">
              {purchaseHistory.length > 0 &&
                purchaseHistory.map((i) => (
                  <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Invoice No</th>
                    <th className="p-3 text-left">Vender Name/ Desc</th>
                    <th className="p-3 text-left">credit</th>
                    <th className="p-3 text-left">Debit</th>
                    <th className="p-3 text-left">Balance</th>
                    <th className="p-3 text-left">Type Of Expense</th>
                    {/* <th className="p-3 text-left">Cleared</th> */}
                  </tr>
                ))}
            </thead>
            <tbody className="flex-1 sm:flex-none border-2 ">
              {purchaseHistory.length > 0 ? (
                purchaseHistory.map((data, i) => (
                  <tr
                    className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 border-2 border-white-600"
                    key={i}
                  >
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {i + 1}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.trasnferredDate.toDate().toLocaleString()}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.invoiceNo?data.invoiceNo:data.toName}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.reason ? data.reason 
                      : data.bankName? data.bankName
                      : data.toName? data.toName
                      : data.paidTo ? data.paidTo
                      : data.To
                    }
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.cAmount ? data.cAmount : data.Amount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.dAmount ? data.dAmount : data.pAmount ?data.pAmount:data.eAmount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.Balance}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.type ? data.type : data.typeOfExpenses}
                    </td>
                    {/* <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.typeOfPayment}
                    </td> */}
                    {/* <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.pCleared ? "Yes" : " No"} 
                    </td>*/}
                  </tr>
                ))
              ) : (
                <div>loading...</div>
              )}
            </tbody>
          </table>
        </section>
        <section id="mobile">
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map((data, i) => (
                <div className="grid grid-cols-3 bg-white p-4 rounded-lg shadow">
                  <div className="h-20 w-28 place-content-center grid grid-rows-2 grid-flow-col gap-1 truncate overflow-hidden">
                    <div className="  ">
                      {data.trasnferredDate.toDate().toLocaleDateString()}
                    </div>
                    <div className=" "> {data.invoiceNo}</div>
                  </div>
                  <div className="justify-self-center row-span-2 place-content-center ">
                    <div className="truncate overflow-hidden whitespace-normal ">
                      {data.reason ? data.reason : data.venderName}
                    </div>
                  </div>
                  <div className="h-20 w-28 place-content-center grid grid-rows-2 grid-flow-col gap-1">
                    <div className=" ">
                      {data.rAmount
                        ? data.rAmount
                        : data.pAmount
                        ? data.pAmount
                        : data.amount}
                    </div>
                    <div className=" ">{data.balance}</div>
                  </div>
                </div>
              ))
            ) : (
              <div>loading...</div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-center">
          <button
              // disabled = {cleared ? cleared : {disable}}

          // disabled
          type="submit"
         
              className={cleared ? "text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-5 shadow-md shadow-blue-500/50 disabled:cursor-no-drop":"text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-5 shadow-md shadow-blue-500/50"}
               
                onClick={handleCloseBalance}
                >
            Accept
          </button>
          <button
            disabled
            type="submit"
            className="text-white bg-gradient-to-br from-red-900 to-red-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-5 shadow-md shadow-blue-500/50 disabled:cursor-no-drop "
          >
            Reject
          </button>
        </div>
             
      </div>
    </div>
  );
};

export default Supertransaction;
