// sudo npm install -g node-firestore-import-export

// firestore-export -a <securitykey with loction of folder catmart-3d857-firebase-adminsdk-at7bl-1e82978e52.json> -b < backup file name datbackup.json> -p

// delete old collection then import 
// firestore-import -a catmart-3d857-firebase-adminsdk-at7bl-1e82978e52.json -b datbackup.json


// import React, { useEffect, useState } from "react";
// import DatePick from "../../components/date/dateTime";
// import Modal from "../../components/Modal/Modal";
// import {
//   onSnapshot,
//   collection,
//   db,
//   query,
//   updateDoc,
//   doc,
//   increment,
// } from "../../utils/firebase";

// const ExpensesAdminCashReturns = () => {
//   //save purchase history
//   const [returnHistory, setReturnHistory] = useState([]);
//   const [showModal, setShowModal] = useState(false);

//   const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
//   // collection ref
//   const returnRef = collection(db, "returnHistory");
//   // queries
//   const q = query(returnRef);
  
//   useEffect(() => {
//     // realtime collection data
    

//     onSnapshot(q, (snapshot) => {
//       let history = [];
//       snapshot.docs.forEach((doc) => {
//         history.push({ ...doc.data(), id: doc.id });
//       });
//       setReturnHistory(history);
//     });
//   }, [onSnapshot])
//   console.log(returnHistory);    
  
//   const handleCashReturns = async (data) => {
//     await updateDoc(doc(db, "returnHistory", data.id), {
//       cleared: true,
//     })
//       .then(
//         async () =>
//           await updateDoc(doc(db, "users", userLogged.uid), {
//             current_balance: increment(Number(data.amount)),
//           })
//       )
//       .then(
//         async () =>
//           await updateDoc(doc(db, "users", data.user), {
//             current_balance: increment(-(Number(data.amount))),
//           })
//       );
//       setShowModal(true)
//   };

//   return (
//     <div className="flex items-center justify-center">
//       <div className="flex flex-col items-center ">
//         <DatePick/>
//         {/* //purchase history */}
//         <section>
//         <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
//             Cash Returns
//           </h3>
//           <table className="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
//             <thead className="text-white">
//               {returnHistory.length > 0 &&
//                 returnHistory.map((r) => (
//                   <tr className="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
//                     <th className="p-3 text-left">#</th>
//                     <th className="p-3 text-left">Name</th>
//                     <th className="p-3 text-left">Amount</th>
//                     <th className="p-3 text-left">Date</th>
//                     <th className="p-3 text-left">Cleared? </th>
//                     <th className="p-3 text-left">Clear </th>
//                   </tr>
//                 ))}
//             </thead>
//             <tbody className="flex-1 sm:flex-none border-2">
//               {returnHistory.length > 0 ? (
//                 returnHistory.map((data, index) => (
//                   <tr
//                     className="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white border-2 border-white-600"
//                     key={index}
//                   >
//                     <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
//                       {index + 1}
//                     </td>
//                     <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
//                       {data.returnedFrom}
//                     </td>
//                     <td className="border-grey-light border hover:bg-gray-100 p-3">
//                       {data.amount}
//                     </td>
//                     <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
//                       {data.returnedAt.toDate().toDateString()}
//                     </td>
//                     <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
//                       {data.cleared === true ? "Yes" : "No"}
//                     </td>
//                     <td className="border-grey-light border hover:bg-gray-100 p-3 truncate">
//                       {data.cleared === true ? (
//                         <button
//                           className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-2 border-blue-700 hover:border-blue-500 rounded"
//                           disabled
//                         >
//                           Cleared
//                         </button>
//                       ) : (
//                         <button
//                           className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-2 border-blue-700 hover:border-blue-500 rounded"
//                           onClick={() => handleCashReturns(data)}
//                         >
//                           Clear
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <dd className="w-full">loading</dd>
//               )}
//             </tbody>
//           </table>
//         </section>
//         <Modal showModal={showModal} setShowModal={setShowModal}/>
//       </div>
//     </div>
//   );
// };

// export default ExpensesAdminCashReturns;
