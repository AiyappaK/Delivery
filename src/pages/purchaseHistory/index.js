import React, { useState, useContext, useEffect } from "react";
import Total from "../../components/boxes/boxes";
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
  orderBy,
} from "../../utils/firebase";

const PurchaseHistory = () => {
  const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);

  //save purchase history
  const [search, setSearch] = useState("");
  const [UserBalance, setUserBalance] = useState([]);
  const [transactionHistory, settransactionHistory] = useState([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [error, setError] = useState("");
  
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [totalCash, setTotalCash] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);


  const [filtred, setFiltred] = useState([]);

  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  // const [dates, setDate] = useState();

  // Time Controls For B2b and B2c
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 1);
  date.setUTCHours(18);
  date.setUTCMinutes(30);

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());

  // realtime collection data
  useEffect(() => {
    let start = new Date(Start);
    let end = new Date(End);
    let Rstart = new Date(Start);
    let Rend = new Date(End);
    let Tstart = new Date(Start);
    let Tend = new Date(End);
    let Dstart = new Date(Start);
    let Dend = new Date(End);

    // balance amount has to caluclated with the help of mannual calculation or fetch from current balance
    const qt = query(
      collection(db, "users"),
      where("uid", "==", userLogged.uid)
    );
    // purchase History will be debit
    const purchaseref = query(
      collection(db, "purchaseHistory"),
      where("purchasedByUserId", "==", userLogged.uid),
      where("trasnferredDate", ">", start),
      where("trasnferredDate", "<", end),
      orderBy("trasnferredDate", "desc")
    );
    // return history will be debit
    const returnref = query(
      collection(db, "returnHistory"),
      where("returneduser", "==", userLogged.uid),
      where("trasnferredDate", ">", Rstart),
      where("trasnferredDate", "<", Rend),
      orderBy("trasnferredDate", "desc")
    );
    // transaction history will be credit
    const deliveryRef = query(
      collection(db, "deliveryHistory"),
      where("deliveredByUserId", "==", userLogged.uid),
      where("trasnferredDate", ">", Dstart),
      where("trasnferredDate", "<", Dend),
      orderBy("trasnferredDate", "desc"),
    )

    const transactionref = query(
      collection(db, "transationHistory"),
      where("to", "==", userLogged.uid),
      where("trasnferredDate", ">", Tstart),
      where("trasnferredDate", "<", Tend),
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
    onSnapshot(returnref, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
    });

    onSnapshot(deliveryRef, (snapshot) => {
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
      console.log(history);
      setPurchaseHistory(history);
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
    let calculatedPaymentArray = [];
    purchaseHistory.map((item) => {
      let debit = [];
      let credit = [];
      if (item.typeOfPayment != "credit") {
        if (item.amount) {
          credit.push(item.amount);
        }
        else if (item.dAmount) {
          credit.push(item.dAmount);
        } else if (item.rAmount) {
          debit.push(item.rAmount);
        } else if (item.pAmount) {
          debit.push(item.pAmount);
        }
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
      let tCash = (totaldebitAmount.reduce((acc, item) => acc + item, 0));
      let tCredit = (totalCreditAmount.reduce((acc, item) => acc + item, 0));
      setTotalCash(tCash)
      setTotalCredit(tCredit)
      setTotalBalance(Number(tCredit - tCash));
    });
  }, [purchaseHistory, End, Start]);

  
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        <div className="flex flex-row items-center px-5 gap-2">
          <Total title={"credit"} balance={totalCash}/>
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
        <div></div>
            <DatePick label={"From"} select={Start} changed={(date) => setStart(date)} />
            <DatePick label={"End"} select={End} changed={(date) => setEnd(date)} />
        
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
                    <th className="p-3 text-left">Payment</th>
                    <th className="p-3 text-left">Type Of Expense</th>
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
                      {data.invoiceNo ? data.invoiceNo : data.from}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                    {data.reason ? 
                        data.reason 
                        : data.customerName ? data.customerName : data.venderName }
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
                      {data.typeOfPayment}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.typeOfExpenses}
                    </td>
                  
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
                <div key={i} className="grid grid-cols-3 bg-white p-4 rounded-lg shadow">
                  <div className="h-20 w-28 place-content-center grid grid-rows-2 grid-flow-col gap-1 truncate overflow-hidden">
                    <div className="">
                      {data.trasnferredDate.toDate().toLocaleDateString()}
                    </div>
                    <div className=" "> {data.invoiceNo}</div>
                  </div>
                  <div className="justify-self-center row-span-2 place-content-center ">
                    <div className="truncate overflow-hidden whitespace-normal ">
                      {data.reason ? 
                        data.reason 
                        : data.customerName ? data.customerName : data.venderName }
                    </div>
                  </div>
                  <div className="h-20 w-28 place-content-center grid grid-rows-2 grid-flow-col gap-1">
                    <div className=" ">
                      {   data.rAmount
                        ? data.rAmount
                        : data.pAmount
                        ? data.pAmount
                        : data.amount
                        ? data.amount
                        : data.dAmount
                        }
                        &nbsp;
                        {data.rAmount
                        ? "DR"
                        : data.pAmount
                        ? "DR"
                        : "CR"}
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
      </div>
    </div>
  );
};

export default PurchaseHistory;
