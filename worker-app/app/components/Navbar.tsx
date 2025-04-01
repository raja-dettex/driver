"use client"
import axios from 'axios'
import { useAuth } from '../contexts/workerContext'
export default function NavBar() {
  const { state, dispatch} = useAuth()
  const handleConnect = async (event: React.MouseEvent<HTMLButtonElement>) => { 
    event.preventDefault()
    try {    
      console.log(state)   
      const response = await axios.post('http://localhost:3000/v1/workers/signIn')
      
      if(response.data && response.data.token) { 
        console.log(response.data.token)
        localStorage.setItem("token", response.data.token)
        dispatch({type: 'LOGIN', payload: {...state, name: 'raja', token: response.data.token}})
        
        setTimeout(()=>console.log(state), 3000);
      }
    }catch(err) { 
      if(err instanceof Error) console.log(err)
    }
  }
    return (
      <nav className="w-full bg-white text-black p-4">
        <div className="container mx-auto w-full flex justify-between items-center">
          <h1 className="text-xl font-bold">Driver</h1>
          <div className="ml-auto mr-0">
          <button className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-lg" onClick={(e) => handleConnect(e)}>
            Connect Wallets
          </button>
        </div>

        </div>
      </nav>
    );
  }
  