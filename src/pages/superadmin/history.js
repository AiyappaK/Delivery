import React, { useState, useEffect } from "react";
import DatePick from "../../components/date/dateTime";

import {
  query,
  onSnapshot,
  where,
  collection,
  db,
  orderBy,
} from "../../utils/firebase";

const Totaltransaction = () => {
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  //save purchase history
  const [agentSelected, setAgentSelected] = useState("");
  const [agents, setAgents] = useState([]);
  const [LoggedUserInfo, setLoggedUserInfo] = useState([]);

  const [search, setSearch] = useState("");
  const [UserBalance, setUserBalance] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [totalCash, setTotalCash] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  const [returnAmount, setReturnAmount] = useState(0);
  const [error, setError] = useState("");

  const [filtred, setFiltred] = useState([]);

  // const [dates, setDate] = useState();

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
        where("role", "!=", "Super_admin")
      );
      onSnapshot(q, (snapshot) => {
        let history =[]
        snapshot.docs.forEach((doc) => {
          history.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        console.log(history);
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
    let Rstart = new Date(Start);
    let Rend = new Date(End);
    let Tstart = new Date(Start);
    let Tend = new Date(End);
    let Dstart = new Date(Start);
    let Dend = new Date(End)

    // balance amount has to caluclated with the help of mannual calculation or fetch from current balance
    const qt = query(
      collection(db, "users"),
      where("uid", "==", userLogged.uid)
    );
    // purchase History will be debit
    const purchaseref = query(
      collection(db, "purchaseHistory"),
      where("purchasedByUserId", "==", agentSelected),
      where("trasnferredDate", ">", start),
      where("trasnferredDate", "<", end),
      orderBy("trasnferredDate", "desc")
    );
    // return history will be debit
    const returnref = query(
      collection(db, "returnHistory"),
      where("returneduser", "==", agentSelected),
      where("trasnferredDate", ">", Rstart),
      where("trasnferredDate", "<", Rend),
      orderBy("trasnferredDate", "desc")
    );
    // transaction history will be credit
    const transactionref = query(
      collection(db, "transationHistory"),
      where("to", "==", agentSelected),
      where("trasnferredDate", ">", Tstart),
      where("trasnferredDate", "<", Tend),
      orderBy("trasnferredDate", "desc")
    );
    const deliveryref = query(
      collection(db, "deliveryHistory"),
      where("deliveredByUserId", "==", agentSelected),
      where("trasnferredDate", ">", Dstart),
      where("trasnferredDate", "<", Dend),
      orderBy("trasnferredDate", "desc")
    );
    onSnapshot(qt, (snapshot) => {
      // let history = [];
      snapshot.docs.forEach((doc) => {
        setUserBalance(doc.data());
      });
    });

    let history = [];
    onSnapshot(purchaseref, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      // setPurchaseHistory(history);
    });
    onSnapshot(deliveryref, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      // setPurchaseHistory(history);
    });
    onSnapshot(returnref, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
    });
    onSnapshot(transactionref, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      history.sort((a, b) => {
        return (
          new Date(b.trasnferredDate.toDate().toLocaleString()) -
          new Date(a.trasnferredDate.toDate().toLocaleString())
        );
      });
      setPurchaseHistory(history);
    });
  }, [onSnapshot, agentSelected, End, Start]);

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

  const handleCloseBalance = async () => {};
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
        <div className="bg-gray-50 px-4 py-5 flex flex-col items-center sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Transfer To</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <div className="mb-3 xl:w-96">
              <select
                className="form-select appearance-none block
      w-full
      px-3
      py-1.5
      text-base
      font-normal
      text-gray-700
      bg-white bg-clip-padding bg-no-repeat
      border border-solid border-gray-300
      rounded
      transition
      ease-in-out
      m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                aria-label="Default select example"
                onChange={(e) => setAgentSelected(e.target.value)}
              >
                <option>Select a user</option>
                {agents.map((doc, i) => (
                          <option key={i} value={doc.uid}>
                            {doc.name}
                          </option>
                        ))}
              </select>
            </div>
          </dd>
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
                      {data.invoiceNo}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.reason ? data.reason : data.venderName ? data.venderName : data.customerName}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.amount ? data.amount : data.dAmount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.rAmount ? data.rAmount : data.pAmount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.Balance}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.typeOfExpenses}
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
                <div key={i} className="grid grid-cols-3 bg-white p-4 rounded-lg shadow" >
                  <div  className="h-20 w-28 place-content-center grid grid-rows-2 grid-flow-col gap-1 truncate overflow-hidden">
                    <div className="  ">
                      {data.trasnferredDate.toDate().toLocaleDateString()}
                    </div>
                    <div className=" "> {data.invoiceNo}</div>
                  </div>
                  <div className="justify-self-center row-span-2 place-content-center ">
                    <div className="truncate overflow-hidden whitespace-normal ">
                    {data.reason ? data.reason : data.venderName ? data.venderName : data.customerName}
                    </div>
                  </div>
                  <div className="h-20 w-28 place-content-center grid grid-rows-2 grid-flow-col gap-1">
                    <div className=" ">
                      
                      {data.amount ? data.amount 
                      : data.dAmount ? data.dAmount
                    : data.rAmount ? data.rAmount:
                      data.pAmount} &nbsp;

{data.amount ? "CR <-" 
                      : data.dAmount ? "CR <-"
                    : data.rAmount ? "DR ->"
                    : data.pAmount? "DR ->" : null}
                      

                    </div>
                    <div className=" ">{data.Balance}</div>
                  </div>
                </div>
              ))
            ) : (
              <div>loading...</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Totaltransaction;
