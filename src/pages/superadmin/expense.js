import React, { useContext, useEffect, useState } from 'react'
import { LoggedInUserContext } from '../../provider/logged_in_user_provider';
import {
    addDoc,
    collection,
    db,
    serverTimestamp,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    increment,
  } from "../../utils/firebase";
  import Modal from "../../components/Modal/Modal";
import imageCompression from "browser-image-compression";

const SuperExpense = () => {
    const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
    const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
    const [disable, setDisabled] = useState(false);
  
    const [showModal, setShowModal] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState("");
    const [customerName, setcustomerName] = useState("");
    const [imageUrl, setimageUrl] = useState("");
  
    const [amount, setAmount] = useState(0);
    const [UserBalance, setUserBalance] = useState([]);
    const [Balance, setBalance] = useState([]);
  
  
    const [typeOfExpenses, setTypeOfExpenses] = useState("delivery");
    const [typeOfPayment, setTypeOfPayment] = useState("cash");
  
    //handle image
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState();
    // collection ref
    // const colRef = collection(db, "purchaseHistory");
  
    onSnapshot(doc(db, "Company", "globalAmount"), (doc) => {
      setBalance(doc.data().Amount);
    });
  
    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
      if (!selectedFile) {
        setPreview(undefined);
        return;
      }
  
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
  
      // free memory when ever this component is unmounted
      return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);
  
    //handle image
    const onSelectFile = (e) => {
      if (!e.target.files || e.target.files.length === 0) {
        setSelectedFile(undefined);
        return;
      }
      const image = e.target.files[0];
      setSelectedFile(image);
    };
    // console.log(selectedFile);
  
    const getAgentInfo = async () => {
      const docRef = await doc(db, "users", userLogged.uid);
      onSnapshot(docRef, (doc) => {
        setLoggedInUser(doc.data());
      });
    };
    getAgentInfo();
  
    // adding docs
    const handleSubmit = async (e) => {
      setDisabled(true)
      e.preventDefault();
      getAgentInfo();
      if (typeOfExpenses === "") {
        return alert("Please select the type of expense");
      }
      if (invoiceNo === "") {
        return alert("Please enter the invoice number");
      }
      if (customerName === "") {
        return alert("Please provide the Customer name");
      }
      if (amount === "" || amount === 0) {
        return alert("Please enter the amount");
      }
      if (typeOfPayment === "") {
        return alert("Please select the mode of payment");
      }
      if (selectedFile === "") {
        return alert(`not an image, the image file is a ${typeof selectedFile}`);
      }
   
      setShowModal(true);
      const options = {
        maxSizeMB: 0.039,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(selectedFile, options);
      const d = new Date();
      let text = d.toLocaleDateString();
      const storageRef = ref(storage, `/Accountexpense/${text}/${loggedInUser.name}/${compressedFile.name}`);
      const fileRef = uploadBytesResumable(storageRef, compressedFile);
      
      fileRef.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          // update progress
          console.log(percent);
        },
        (err) => console.log(err),
  
        () => {
          // download url
          getDownloadURL(fileRef.snapshot.ref).then((downloadUrl) => {
            console.log("File available at", downloadUrl);
            if (typeOfPayment === "credit") {
              let c = "Na"
             post(downloadUrl, c);
            }
            else{
              let c = Number(Balance - amount)
              post(downloadUrl, c);
            }
          });
        }
      );
    };
    let post = async (downloadUrl, balance) => {
      await addDoc(collection(db, "companyHistory"), {
        Balance: balance,
        To: customerName,
        eAmount: amount,
        trasnferredDate: serverTimestamp(),
        Accountant: userLogged.name,
      AccountantByUserId: userLogged.uid,
      typeOfExpenses: "Expense",
        downloadUrl,
        
      }).then(async () => {
        if (typeOfPayment === "cash") {
        await updateDoc(doc(db, "Company", "globalAmount"), {
            Amount:increment(-(Number(amount)))
          });
        }
        setShowModal(false);
        setInvoiceNo("");
        
      });
    };
    return (
      //save purchase info card
  
      <div className="flex justify-center mt-4 ">
        <div className="block rounded-lg shadow-lg bg-white max-w-sm text-center md:w-1/2">
          <Modal
            process={"uploading..."}
            showModal={showModal}
            setShowModal={setShowModal}
          />
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
           Expense
            </h3>
  
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="p-6 ">
              
              {/* invoice # */}
              <div className="mb-3 ">
                <label
                  htmlFor="exampleText0"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Expense Reason
                </label>
                <input
                  type="text"
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
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
        "
                  placeholder="Reason"
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>
  
              {/* Customer name */}
              <div className="mb-3 ">
                <label
                  htmlFor="exampleText0"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Payment To
                </label>
                <input
                  type="text"
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
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
        "
                  placeholder="Customer Name"
                  onChange={(e) => setcustomerName(e.target.value)}
                />
              </div>
              <div className="mb-3 ">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment mode
                </label>
                <div className="mt-1 relative rounded-md shadow-sm border border-gray-300">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹ </span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder={0.0}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="currency" className="sr-only">
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                      onChange={(e) => setTypeOfPayment(e.target.value)}
                    >
                      
                      <option value="cash">Cash</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {selectedFile && <img src={preview} />}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover photo
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/x-png, image/jpeg"
                          className="sr-only"
                          onChange={onSelectFile}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
                    disabled={disable}

              type="submit"
              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-5 shadow-md shadow-blue-500/50 "
             
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
}
export default SuperExpense;