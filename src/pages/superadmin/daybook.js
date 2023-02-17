import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal/Modal";
import {
  query,
  getDocs,
  getDoc,
  onSnapshot,
  where,
  collection,
  db,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  orderBy,
} from "../../utils/firebase";

const Daybook = () => {
  const [daybook , setDaybook] = useState([])

   // Time Controls For B2b and B2c
   let date = new Date();
   // remove a day
   date.setDate(date.getDate() - 2);
   date.setUTCHours(18);
   date.setUTCMinutes(30);
 
   const [Start, setStart] = useState(date);
   const [End, setEnd] = useState(new Date());

   let start = new Date(Start);
   let end = new Date(End);
   
   useEffect(()=>{
   })
   
  const daybookRef = query(
    collection(db, "daybook"),
   where("generatedDate", ">", start),
   where("generatedDate", "<", end),
   orderBy("generatedDate", "desc")
   )

   let a = []
  onSnapshot(daybookRef, (snapshot) => {
    // console.log('su',snapshot.docs);

    let balance = []
    // snapshot.docs.forEach((doc) => {
    //   balance.push({
    //     ...doc.data(),
    //     id: doc.id,
    //   });
    
      // console.log("balance",balance)
      // balance.map(i => 
      //   console.log(i.Balance , i.daybook[0]),
        // daybook.forEach(d => console.log(d))
        // )      
    // });

    snapshot.docs.forEach((doc) => {
       doc.data().daybook.map(c => 
        a.push(c)
        // console.log(c.trasnferredDate)
        )
      });
      
    console.log(a);
      setDaybook(a)
  })
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        {/* //send money */}
        <section className="w-full ">
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Daybook money
          </h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6"></div>
            <div className="border-t border-gray-200">
              <dl>
                
                <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
                  <thead className="text-white">
                    <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Invoive</th>
                      <th className="p-3 text-left">Inward</th>
                      <th className="p-3 text-left">From</th>
                      <th className="p-3 text-left">Desciption</th>
                      <th className="p-3 text-left">Credit</th>
                      <th className="p-3 text-left">Debit</th>
                      <th className="p-3 text-left">Balance</th>
                      
                      <th className="p-3 text-left">Payment</th>
                      <th className="p-3 text-left">Expense</th>
                    </tr>
                  </thead>
                  <tbody className="flex-1 sm:flex-none border-2 ">
              {daybook.length > 0 ? (
                daybook.map((data, i) => (
                  console.log(data),
                  <tr
                    className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 border-2 border-white-600"
                    key={i}
                  >
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {i + 1}
                    </td>
                   {/* { data.daybook.map((data,i) => ( */}
                   {/* {data.trasnferredDate !== undefined ? */}
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.trasnferredDate !== undefined ? data.trasnferredDate.toDate().toLocaleString() : data.SettlementDate.toLocaleString()}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.invoiceNo}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.inwardID}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                    {data.purchasedBy?data.purchasedBy
                    :data.returnedFrom?data.returnedFrom 
                    : data.toName? data.toName
                    : data.deliverdBy? data.deliverdBy 
                    : data.Accountant ? data.Accountant
                    : data.froms ? data.froms 
                    : null
                  }
                    </td>

                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                    {data.reason ? 
                        data.reason 
                        : data.customerName ? data.customerName : data.venderName ? data.venderName: data.bankName ? data.bankName : data.To ? data.To: data.paidTo}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                     {data.cAmount}
                    </td>
                    
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.amount ? data.amount : data.dAmount ?data.dAmount : data.rAmount ? data.rAmount : data.pAmount ? data.pAmount : data.eAmount}
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      <b>{data.TBalance}</b>
                    </td>
                    <td className="border-grey-light border hover:bg-gray-100 p-3   truncate ">
                      {data.typeOfExpenses}
                    </td>
                    
                     {/* ))} */}
                    
                    
                    
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
                
              </dl>
            </div>
          </div>
        </section>
        <Modal
        //   process={`Transferred to ${agentSelectedInfo.name}`}
        //   showModal={showModal}
        //   setShowModal={setShowModal}
        />
      </div>
    </div>
  );
};
export default Daybook;
