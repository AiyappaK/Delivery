import React, { useContext, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

import { storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  addDoc,
  collection,
  db,
  serverTimestamp,
  onSnapshot,
  doc, updateDoc, increment } from "../../utils/firebase";
import { LoggedInUserContext } from "../../provider/logged_in_user_provider";
import Modal from "../../components/Modal/Modal";

const Addmoney = () => {
    const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
    const userLogged = JSON.parse(localStorage.getItem("loggedInUser"));
    const [Amount, setAmount] = useState(0);
    const [Bank, setBank] = useState("");
    const [Balance, setBalance] = useState([]);
    const [disable, setDisabled] = useState(false);



  //handle image
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();

  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{
    onSnapshot(doc(db, "Company", "globalAmount"), (doc) => {
      setBalance(doc.data().Amount);
    });
  },[onSnapshot])
  
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

  
  const getAgentInfo = async () => {
    const docRef = await doc(db, "users", userLogged.uid);
    onSnapshot(docRef, (doc) => {
      setLoggedInUser(doc.data());
    });
  };

  getAgentInfo();

  const handleSubmit = async (e) => {
    setDisabled(true)
    e.preventDefault();
    if (Bank === "") {
      return alert("Please select the type of Bank name");
    }
    if (Amount === "" || Amount <= 0) {
      return alert("Enter the correct Amount");
    }
    if (selectedFile === "" || !selectedFile || selectedFile.length === 0) {
      return alert("Select Image");
    }
    // setShowModal(true);
    const options = {
      maxSizeMB: 0.039,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(selectedFile, options);
    const d = new Date();
    let date = d.toDateString();

    const storageRef = ref(
      storage,
      `/Accountchallan/${date}/${loggedInUser.name}/${compressedFile.name}`
    );
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
           
              let c = Number(Balance + Amount)
              add(downloadUrl, c);
            
          });
        
      }
    );
  };
  let add = async (downloadUrl,balance) => {
    setShowModal(true)
    await addDoc(collection(db, "AmountHistory"), {
      Balance: balance,
      cAmount: Amount,
      bankName: Bank,
      trasnferredDate: serverTimestamp(),
      Accountant: loggedInUser.name,
      AccountantByUserId: loggedInUser.uid,
      downloadUrl,
      
    }).then(async () => {
      await updateDoc(doc(db, "Company", "globalAmount"), {
          Amount:increment((Number(Amount)))
        });
        setShowModal(false);
    });
    setBank("");
    setAmount("");
    setSelectedFile("")

  };
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center ">
        {/* //send money */}
        <section className="w-full ">
          <h3 className="font-medium leading-tight text-center text-3xl mt-0 mb-2 text-blue-600">
            Add Money
          </h3>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-white px-4 py-5 sm:flex sm:flex-cols-3 sm:gap-4 sm:px-6">
                    <div className="w-14">
                      <dt className="text-sm font-medium text-gray-500">
                        Bank Name
                      </dt>
                    </div>

                    <dd className="mt-1 w-auto text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
                                transition
                                ease-in-out
                                m-0
                                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                                "
                        id="exampleNumber0"
                        placeholder="Bank name"
                        onChange={(e) => setBank(e.target.value)}
                      />
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:flex sm:flex-cols-3 sm:gap-4 sm:px-6">
                    <div className="w-14">
                      <dt className="text-sm font-medium text-gray-500">
                        Amount
                      </dt>
                    </div>
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
                        placeholder="Amount"
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </dd>
                  </div>
                  <div className=" bg-gray-50 px-4 py-5 sm:flex sm:flex-cols-3 sm:gap-4 sm:px-6">
                    <div className="w-14">
                      <dt className="text-sm font-medium text-gray-500">
                        Challan
                      </dt>
                    </div>
                    <div className="flex flex-col">
                      {selectedFile && <img className="w-60" src={preview} />}

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
                                onChange={(e) =>
                                  setSelectedFile(e.target.files[0])
                                }
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
                  <div className="flex justify-center bg-white  px-4 py-5 sm:px-6">
                    <button
                    disabled={disable}
                      type="submit"
                      className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-5 shadow-md shadow-blue-500/50 "
                      // onClick={(e) => handleSubmit(e)}
                    >
                      Submit
                    </button>
                  </div>
                </dl>
              </div>
            </div>
          </form>
        </section>
        <Modal process={`Uploading...`} showModal={showModal} setShowModal={setShowModal} />
      </div>
    </div>
  );
};
export default Addmoney;
