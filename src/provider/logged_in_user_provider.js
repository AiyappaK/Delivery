import { createContext, useState } from "react";

export const LoggedInUserContext = createContext();

export const LoggedInUserProvider = (props) => {
  const [loggedInUser, setLoggedInUser] = useState([]);

  return (
    <LoggedInUserContext.Provider value={[loggedInUser, setLoggedInUser]}>
      {props.children}
    </LoggedInUserContext.Provider>
  );
};
