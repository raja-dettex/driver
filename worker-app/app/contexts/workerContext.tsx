"use client"

import React, { createContext, ReactNode, useContext, useReducer } from "react"


interface IWorkerAuth { 
    name: string,
    token: string,
    currentTaskId: number
}


type AuthAction = {type: 'LOGIN', payload: IWorkerAuth} | { type: 'LOGOUT'} | { type : 'SET_TASK_ID', payload: IWorkerAuth}


const initialState:  IWorkerAuth = { name: "", token: "", currentTaskId: 3 };

const authReducer = (state: IWorkerAuth, action: AuthAction)=>  { 
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

const WorkerAuthContext = createContext<{state: IWorkerAuth; dispatch: React.Dispatch<AuthAction>} | null>(null)

export const WokrerAuthProvider = ({children}: {children: ReactNode}) => { 
    const [state, dispatch] = useReducer(authReducer, initialState)
    return <WorkerAuthContext.Provider value={{state, dispatch}}>
        {children}
    </WorkerAuthContext.Provider>
}

export const useAuth = () => { 
    const context = useContext(WorkerAuthContext)
    if(!context) {
        throw new Error("weird invocation")
    }
    return context
}