"use client"

import { Issue } from "next/dist/build/swc/types"
import React, { createContext, ReactNode, useContext, useReducer } from "react"


interface IUserAuth { 
    name: string,
    token: string,
    currentTaskId: number
}


type AuthAction = {type: 'LOGIN', payload: IUserAuth} | { type: 'LOGOUT'} | { type : 'SET_TASK_ID', payload: IUserAuth}


const initialState: IUserAuth = { name: "", token: "", currentTaskId: 3 };

const authReducer = (state: IUserAuth, action: AuthAction)=>  { 
    switch(action.type) { 
        case 'LOGIN':
            console.log("control reaches here")
            return { ...state, name: action.payload.name, token: action.payload.token}
        case 'LOGOUT':
            return initialState
        case 'SET_TASK_ID':
            return { ...state, currentTaskId: action.payload.currentTaskId}
        default:
            return state
    }
} 

const UserAuthContext = createContext<{state: IUserAuth; dispatch: React.Dispatch<AuthAction>} | null>(null)

export const UserAuthProvider = ({children}: {children: ReactNode}) => { 
    const [state, dispatch] = useReducer(authReducer, initialState)
    return <UserAuthContext.Provider value={{state, dispatch}}>
        {children}
    </UserAuthContext.Provider>
}

export const useAuth = () => { 
    const context = useContext(UserAuthContext)
    if(!context) {
        throw new Error("weird invocation")
    }
    return context
}