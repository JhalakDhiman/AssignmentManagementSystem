import { createContext,useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({children})=>{

    const [user,setUser] = useState(localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):null);
    const [token,setToken] = useState(localStorage.getItem("token")?JSON.parse(localStorage.getItem("token")):null);

    return (
        <AuthContext.Provider value={{user,setUser,token,setToken}}>
            {children}
        </AuthContext.Provider>
    )
}