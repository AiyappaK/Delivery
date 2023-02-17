import React, { useState, useContext, useEffect } from "react";
import DatePick from "../../components/date/dateTime";
import Imagemodal from "../../components/Modal/imagemodal";

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

const Deliveryreport = () => {
  const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);

  //save purchase history
  const [search, setSearch] = useState("");

  const [deliveryHistory, setdeliveryHistory] = useState([]);
  const [error, setError] = useState("");
  const [totalCash, setTotalCash] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [Filter, setFilter] = useState(0);
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ViewModalID, setViewModalID] = useState(null);


  // const [dates, setDate] = useState();

  // Time Controls For B2b and B2c
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 2);
  date.setUTCHours(18);
  date.setUTCMinutes(30);

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());

  // realtime collection data
  useEffect(() => {
    let start = new Date(Start);
    let end = new Date(End);
    const f = query(
      collection(db, "deliveryHistory"),
      where("deliveredByUserId", "==", userLogged.uid),
      where("typeOfExpenses", "==", "delivery"),
      where("trasnferredDate", ">=", start),
      where("trasnferredDate", "<=", end),
      orderBy("trasnferredDate", "desc")
    );
    onSnapshot(f, (snapshot) => {
      let history = [];
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      setdeliveryHistory(history);
    });
  }, [onSnapshot, End, Start]);

  useEffect(() => {
    let filteredData = deliveryHistory.filter((item) => {
      if (deliveryHistory.length >= 0) {
        return (
          item.deliverdBy.toLowerCase().includes(search.toLowerCase()) ||
          item.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
          item.typeOfPayment.toLowerCase().includes(search.toLowerCase()) ||
          item.typeOfExpenses.toLowerCase().includes(search.toLowerCase()) ||
          item.venderName.toLowerCase().includes(search.toLowerCase())
        );
      }
    });

    setTotalCash(0);
    let calculatedPaymentArray = [];
    filteredData.map((item) => {
      let cash = [];
      let credit = [];
      if (item.cleared) {
        if (item.typeOfPayment === "credit") {
          credit.push(item.dAmount);
        } else if (item.typeOfPayment === "cash") {
          cash.push(item.dAmount);
        }
        calculatedPaymentArray.push({
          credit: credit.reduce((acc, selectedItem) => acc + selectedItem, 0),
          cash: cash.reduce((acc, selectedItem) => acc + selectedItem, 0),
        });
        let totalCashdAmount = [];
        let totalCreditdAmount = [];
        calculatedPaymentArray.map(
          (item, i) => (
            totalCashdAmount.push(Number(item.cash)),
            totalCreditdAmount.push(Number(item.credit))
          )
        );
        setTotalCash(totalCashdAmount.reduce((acc, item) => acc + item, 0));
        setTotalCredit(totalCreditdAmount.reduce((acc, item) => acc + item, 0));
      }
    });
    setFilter(filteredData);
  }, [deliveryHistory, search]);
  
  const viewimage = (data) => {
    setViewModalID(data.id)
    setShowModal(true);
  }
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        <div className="py-4">
          <div className=" w-32 border-solid border-2 border-indigo-600 rounded font-medium ">
            <h6>Total Delivery</h6>
            <h3>
              {totalCash}
              &nbsp; INR
            </h3>
          </div>
        </div>
        <DatePick label={"From"} select={Start} changed={(e) => setStart(e)} />
        <DatePick label={"To"} select={End} changed={(e) => setEnd(e)} />

        <div className="py-4 ">
          <input
            className="bg-white p-2 w-auto focus:ring-violet-300"
            autoFocus
            type="search"
            placeholder="Search by name, number, etc ..."
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>
        <section>
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
          Delivery History
          </h3>

          <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
            <thead className="text-white">
              {Filter.length > 0 &&
                Filter.map((i) => (
                  <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Invoice No</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Vender Name</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Type Of Expense</th>
                    <th className="p-3 text-left">Type Of Payment</th>
                    <th className="p-3 text-left"></th>
                    <th className="p-3 text-left">Cleared</th>
                  </tr>
                ))}
            </thead>
            <tbody className="flex-1 sm:flex-none border-2 ">
              {Filter.length > 0 ? (
                Filter.map((data, i) => (
                  <tr
                    className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 border-2 border-white-600"
                    key={i}
                  >
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {i + 1}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.invoiceNo}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.trasnferredDate.toDate().toLocaleString()}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.customerName}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.dAmount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.typeOfExpenses}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.typeOfPayment}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                    {ViewModalID === data.id ? <Imagemodal
                        Image={data.downloadUrl}
                        showModal={showModal}
                        setShowModal={setShowModal}
                        Heading={data.venderName}
                      />: null}
                     
                      <button
                        class="bg-cyan-500 text-white active:bg-cyan-600 font-bold uppercase
                        text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none
                        focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => viewimage(data)}
                      >
                        View
                      </button>
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.cleared ? "Yes" : " No"}
                    </td>
                  </tr>
                ))
              ) : (
                <div>loading...</div>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Deliveryreport;
