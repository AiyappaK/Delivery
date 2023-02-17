import React, { useEffect, useState } from "react";
import DatePick from "../../components/date/dateTime";
import Imagemodal from "../../components/Modal/imagemodal";
import {
  onSnapshot,
  collection,
  db,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
} from "../../utils/firebase";

const Expensesdeliveryhistory = () => {
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 5);
  date.setUTCHours(18);
  date.setUTCMinutes(30);

  const [Start, setStart] = useState(date);
  const [Edit, setEdit] = useState(true);
  const [End, setEnd] = useState(new Date());
  const [error, setError] = useState("");
  const [totalCash, setTotalCash] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [selectedID, setSelectedID] = useState(null);
  const [update, setUpdate] = useState(true);
  
  const[ invoiceNo, setInvoiceNo ] = useState("")
  const[ venderName , setVenderName ] = useState("")
  const[ pAmount, setAmount] = useState("")
  const[ typeOfPayment, setTypeOfPayment] = useState("")
  const[ typeOfExpenses, setTypeOfExpenses ] = useState("")

  const [ViewModalID, setViewModalID] = useState(null);
  const [showModal, setShowModal] = useState(false);


  const [Filter, setFilter] = useState(0);
  //save purchase history
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // collection ref
    const colRef = collection(db, "deliveryHistory");
    // queries
    let start = new Date(Start);
    let end = new Date(End);
    const q = query(
      colRef,
      where("trasnferredDate", ">", start),
      where("trasnferredDate", "<", end)
    );

    // realtime collection data
    onSnapshot(q, (snapshot) => {
      let history = [];
      snapshot.docs.forEach((doc) => {
        history.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      // console.log(history);
      setDeliveryHistory(history);
    });
  }, [onSnapshot, deliveryHistory, End, Start]);

  useEffect(() => {
    let filteredData = deliveryHistory.filter((item) => {
      if (deliveryHistory.length >= 0) {
        return (
          item.deliverdBy.toLowerCase().includes(search.toLowerCase()) ||
          item.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
          item.typeOfPayment.toLowerCase().includes(search.toLowerCase()) ||
          item.typeOfExpenses.toLowerCase().includes(search.toLowerCase()) ||
          item.customerName.toLowerCase().includes(search.toLowerCase())
        );
      }
    });

    setTotalCash(0);
    let calculatedPaymentArray = [];
    filteredData.map((item) => {
      let cash = [];
      let credit = [];
      // if (item.cleared) {
        if (item.typeOfPayment === "credit") {
          credit.push(item.dAmount);
        } else if (item.typeOfPayment === "cash") {
          cash.push(item.dAmount);
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
      // }
    });
    setFilter(filteredData);
  }, [deliveryHistory, search]);

  const viewimage = (data) => {
    setViewModalID(data.id)
    setShowModal(true);
  }
  
  const handleInvoice = async (data) => {
    await updateDoc(doc(db, "deliveryHistory", data.id), {
      pCleared: "true",
    });
  };
  // const handleUpdate = (data) => {
  //    updateDoc(doc(db, "purchaseHistory", data.id), {
  //     balance: UserBalance.current_balance - pAmount,
  //     invoiceNo: invoiceNo,
  //     venderName: venderName,
  //     pAmount: pAmount,
  //     typeOfExpenses: typeOfExpenses,
  //     typeOfPayment: typeOfPayment,
      
  //   });
  // };
  // const handleEdit = (data) => {
  //   setSelectedID(data.id);
  //   setUpdate(true);
  // };
  // Filter Search
  // const filteredData = purchaseHistory.filter((item) => {
  //   if (purchaseHistory.length >= 0) {
  //     return (
  //       item.purchasedBy.toLowerCase().includes(search.toLowerCase()) ||
  //       item.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
  //       item.typeOfPayment.toLowerCase().includes(search.toLowerCase()) ||
  //       item.typeOfExpenses.toLowerCase().includes(search.toLowerCase()) ||
  //       item.venderName.toLowerCase().includes(search.toLowerCase())
  //     );
  //   }
  // });

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        <div className="flex flex-row py-2">
          <div className="px-4">
            <div className=" w-20  border-solid border-2 border-indigo-600 rounded font-medium ">
              <h6>Cash</h6>
              <h3>
                {totalCash}
                &nbsp; INR
              </h3>
            </div>
          </div>

          <div className="px-4">
            <div className=" w-20 items-center border-solid border-2 border-indigo-600 rounded font-medium ">
              <h6>Credit</h6>
              <h3>
                {totalCredit}
                &nbsp; INR
              </h3>
            </div>
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
        {/* //purchase history */}
        <section>
          <h3 class="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Delivery History
          </h3>

          <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
            <thead className="text-white">
              {Filter.length > 0 &&
                Filter.map((r) => (
                  <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Invoice No</th>
                    <th className="p-3 text-left">Vender Name</th>
                    <th className="p-3 text-left">Agent Name</th>
                    <th className="p-3 text-left">Date and Time</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Type Of Expense</th>
                    <th className="p-3 text-left">Type Of Payment</th>
                    <th></th>
                    
                  </tr>
                ))}
            </thead>
            <tbody className="flex-1 sm:flex-none">
              {Filter.length > 0 ? (
                Filter.map((data, i) => (
                  <tr
                    className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white  border-2 border-white-600"
                    key={data.id}
                  >
                    <td className="border-grey-light border hover:bg-gray-100 p-3">
                      {i + 1}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3">
                      {selectedID === data.id ? (
                        <input
                          className="px-2 w-32"
                          value={data.invoiceNo}
                          onChange={(e) => setInvoiceNo(e.target.value)}
                        />
                      ) : (
                        data.invoiceNo
                      )}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {selectedID === data.id ? (
                        <input
                          className="px-2 w-32"
                          value={data.customerName}
                          onChange={(e) => setVenderName(e.target.value)}
                        />
                      ) : (
                        data.customerName
                      )}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {data.deliverdBy}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {data.trasnferredDate.toDate().toLocaleString()}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {selectedID === data.id ? (
                        <input
                          className="px-2 w-32"
                          value={data.dAmount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      ) : (
                        data.dAmount
                      )}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {selectedID === data.id ? (
                        <select
                          id="currency"
                          name="currency"
                          className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                          onChange={(e) => setTypeOfExpenses(e.target.value)}
                        >
                          <option value="purchase">Purchase</option>
                          <option value="miscellaneous">Miscellaneous</option>
                        </select>
                      ) : (
                        data.typeOfExpenses
                      )}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
                      {selectedID === data.id ? (
                        <select
                          id="currency"
                          name="currency"
                          className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                          onChange={(e) => setTypeOfPayment(e.target.value)}
                        >
                          <option value="cash">Cash</option>
                          <option value="credit">Credit</option>
                        </select>
                      ) : (
                        data.typeOfPayment
                      )}
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
                    {/* <td className="border-grey-light border hover:bg-gray-100  truncate">
                      {data.pCleared ? (
                        <h5>clear</h5>
                      ) : (
                        <button
                          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-1 border-blue-700 hover:border-blue-500 rounded"
                          onClick={() => handleInvoice(data)}
                        >
                          not cleared
                        </button>
                      )}
                    </td> */}
                    {/* <td className="border-grey-light border hover:bg-gray-100  truncate">
                      {data.pCleared ? (
                        <h5>cannot be Edit</h5>
                      ) : selectedID === data.id || !update ? (
                        <button
                          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-1 border-blue-700 hover:border-blue-500 rounded"
                          onClick={() => handleUpdate(data)}
                        >
                          {" "}
                          Update{" "}
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-1 border-blue-700 hover:border-blue-500 rounded"
                          onClick={() => handleEdit(data)}
                        >
                          Edit
                        </button>
                      )}
                    </td> */}
                  </tr>
                ))
              ) : (
                <dd className="w-full">loading</dd>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Expensesdeliveryhistory;
