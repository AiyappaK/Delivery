import React, { useState, useEffect } from "react";
import { disable } from "workbox-navigation-preload";
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
} from "../../utils/firebase";

const Moneytransfer = () => {
  const [agents, setAgents] = useState([]);
  const [agentSelected, setAgentSelected] = useState("");
  const [agentSelectedInfo, setAgentSelectedInfo] = useState([]);
  const [disable, setDisabled] = useState(false);

  const [LoggedUserInfo, setLoggedUserInfo] = useState([]);
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    onSnapshot(doc(db, "Company", "globalAmount"), (doc) => {
      setBalance(doc.data().Amount);
    });

    const tez = async () => {
      const q = query(
        collection(db, "users"),
        where("role", "!=", "Super_admin")
      );
      const querySnapshot = await getDocs(q);
      const agentsList = querySnapshot.docs.map((doc) => doc.data());
      setAgents(agentsList);
      // console.log(agents);

      const docSnap = await getDoc(doc(db, "users", userLogged.uid));
      setLoggedUserInfo(docSnap.data());
    };
    tez();
  }, []);

  useEffect(() => {
    getAgentInfo();
  }, [agentSelected]);

  const getAgentInfo = async () => {
    const docRef = await doc(db, "users", agentSelected);
    const docSnap = await getDoc(docRef);
    setAgentSelectedInfo(docSnap.data());
    console.log(docSnap.data());
  };
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  const handleSubmit = async (e) => {
    
  setDisabled(true)
    e.preventDefault();
    if (agentSelected === "")
      return alert(
        "Please select the agent to who amount is to be transferred"
      );
    if (balance < amount) return alert("No Credit left");
    if (amount === 0) return alert("Please enter the amount");
    if (reason === "") return alert("Please provide the reason");
    setShowModal(true);


    const transRef = collection(db, "transationHistory");

    addDoc(transRef, {
      Balance: (Number(agentSelectedInfo.current_balance) + Number(amount)),
      amount: Number(amount),
      trasnferredDate: serverTimestamp(),
      received: true,
      from: userLogged.name,
      userID: userLogged.uid,
      reason: reason,
      to: agentSelectedInfo.uid,
      toName: agentSelectedInfo.name,
    });

    await addDoc(collection(db, "accountHistory"), {
      Balance: Number(balance-amount),
      dAmount: Number(amount),
      trasnferredDate: serverTimestamp(),
      Accountant: userLogged.name,
      AccountantByUserId: userLogged.uid,
      reason: reason,
      to: agentSelectedInfo.uid,
      toName: agentSelectedInfo.name,
    }).then(async () => {
      await updateDoc(doc(db, "Company", "globalAmount"), {
        Amount: increment(-Number(amount)),
      });
      //update the receiver
      await updateDoc(doc(db, "users", agentSelected), {
        current_balance: increment(Number(amount)),
      });
    });
    setShowModal(false);
    setAgentSelected("");
    setAmount("");
    setReason("");
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        {/* //send money */}
        <section className="w-full ">
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Transfer money
          </h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Transfer money to agents
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Transfer To
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="mb-3 xl:w-96">
                      <select
                        className="form-select appearance-none
      block
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
                        <option value="">Select a user</option>
                        {agents.map((doc, i) => (
                          <option key={i} value={doc.uid}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Transfer Amount
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <input
                      type="number"
                      className="
        form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
      "
                      id="exampleNumber0"
                      placeholder="Amount input"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </dd>
                  <dt className="">Balance : {balance} ₹</dt>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reason</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <textarea
                      className="
        form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
      "
                      id="exampleFormControlTextarea1"
                      rows="3"
                      placeholder="Your message"
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </dd>
                </div>
                <div className="flex justify-center bg-white  px-4 py-5 sm:px-6">
                  <button
                  disabled={disable}
                    onClick={(e) => handleSubmit(e)}
                    type="button"
                    className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Submit
                  </button>
                </div>
              </dl>
            </div>
          </div>
        </section>
        <Modal
          process={`Transferred to ${agentSelectedInfo.name}`}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </div>
    </div>
  );
};

export default Moneytransfer;
