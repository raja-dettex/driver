
import axios, { AxiosError} from "axios";
import { useAuth } from "../contexts/userContext";
import { Task } from "../types";


export const getPresignedPutUrl = async (filename: string, token: string): Promise<{putUrl: string, getUrl: string} | null> => { 
    try { 
      const response = await axios.get(`http://localhost:3000/v1/users/urls/${filename}`, {headers: { Authorization: `Bearer ${token}`}})
      if(response.data && response.data.urls) return { putUrl: response.data.urls[0] as string, getUrl: response.data.urls[1] as string }   
      return null  
    } catch( err) { 
      if(err instanceof AxiosError) { 
        console.log(err)
        return null
      }
      return null
    }
  }


  export const submitTask = async (token: string, {options, title, signature}: Task): Promise<{id: number} | null> => { 
    try { 
      const response = await axios.post('http://localhost:3000/v1/users/tasks', {
        options,title, signature
      }, { headers: { 
        Authorization: `Bearer ${token}`
      }})
      if(response.data) return response.data
      return null
    } catch(err) { 
      console.log(err)
      return null
    }
  }
  export const upload = async (url: string, file: File, type: string) => { 
    try { 
      const response = axios.put(url, file, {headers: {
        "Content-Type": type,
        //"Content-Length": length
      }})
      return response
    } catch(err) { 
      if(err instanceof AxiosError) return err.response
    }
  }