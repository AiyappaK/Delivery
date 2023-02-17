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
  getDoc,
  getDocs,
} from "../../utils/firebase";

const Retun = () => {
  const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
  //save purchase history
  const [transactionHistory, settransactionHistory] = useState([]); 
  const [UserBalance, setUserBalance] = useState([]);
  const [disable, setDisabled] = useState(false);
  
  const [returnAmount, setReturnAmount] = useState(0);
  const [error, setError] = useState("");
  const [agents, setAgents] = useState([]);
  const [agentSelected, setAgentSelected] = useState("");
  const [agentSelectedInfo, setAgentSelectedInfo] = useState([]);
  const [LoggedUserInfo, setLoggedUserInfo] = useState([]);

  
  
  let date = new Date();
  // remove a day
  date.setDate(date.getDate() - 1);
  date.setUTCHours(18);
  date.setUTCMinutes(30);

  const [Start, setStart] = useState(date);
  const [End, setEnd] = useState(new Date());
  
  const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));

  
  useEffect(() => {
    const tez = async () => {
      const q = query(
        collection(db, "users"),
        where("role", "!=", "purchase_agent")
      );
      
      const querySnapshot = await getDocs(q);
      const agentsList = querySnapshot.docs.map((doc) => doc.data());
      setAgents(agentsList);
      
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
  };

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
      history.sort((a,b)=>{
        return new Date(b.trasnferredDate.toDate().toDateString()) - new Date(a.trasnferredDate.toDate().toDateString())
      })
      settransactionHistory(history);
    });    
  }, [onSnapshot, Start, End ]);

  const handleReturn = () => {
    setDisabled(true)
    if (
      returnAmount <= 0 ||
      returnAmount === "" ||
      UserBalance.current_balance < returnAmount
    ) {
      return setError("enter correct amount");
    }
    addDoc(collection(db, "returnHistory"), {
      Balance: Number(UserBalance.current_balance) - Number(returnAmount),
      rAmount: returnAmount,
      trasnferredDate: serverTimestamp(),
      received: "false",
      returnedFrom: userLogged.name,
      returneduser: userLogged.uid,
      returnTo:agentSelectedInfo.name,
      returnID: agentSelectedInfo.uid
    });
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
        <section>
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Clear balance
          </h3>
          <div>{error && <h5 className="text-red-400">{error}</h5>}</div>
          <div className="flex flex-col items-center justify-center">
         
            
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
            <input
              type="number"
              class="form-control sm:col-span-2  px-4 py-2 mb-2 md:mb-0 md:mr-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none appearance-none "
              placeholder="Enter the amount"
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setReturnAmount(e.target.value)}
            />
                  <dt className="text-sm font-medium text-gray-500">
                    Transfer To
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 ">
                    <div className="mb-3 xl:w-50">
                      <select
                        className="form-select appearance-none
      block
      w-auto
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

            <button
              type="submit"
              class="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
              data-mdb-ripple="true"
              data-mdb-ripple-color="light"
              disabled={disable}
              onClick={() => handleReturn()}
            >
              Return
            </button>
          </div>
        </section>
      
      </div>
    </div>
  );
};

export default Retun;
