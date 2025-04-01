"use client"
import { useEffect, useState } from 'react'
interface Task { 
    id: number,
    title: string,
    amount: number,
    options: { 
        id: number, 
        task_id: number, 
        image_url: string
    }[]
}

interface Option { 
    id: number, 
    task_id: number, 
    image_url: string
}
import axios from 'axios'
import { useAuth } from '../contexts/workerContext'

export default function Task() { 
    const [taskId, setTaskId] = useState(0);
     const [title, setTitle] = useState<string | null>(null)
     const [amount, setAmount] = useState(0)
     const [payableAmout, setPayableAmount] = useState(0);
     const [options, setOptions] = useState<Option[]>();
    const {state} = useAuth()
    let {token} = state
    if(token === '')  { 
        token = localStorage.getItem('token') ?? ''
    }
    useEffect(() => { 
        console.log('token ' , token)
        axios.get('http://localhost:3000/v1/workers/nextTask', { 
            headers: { Authorization: `Bearer ${token}`}
        } ).then(res =>  { 
            const {id, amount, title, options } = res.data.nextTask;
            console.log(res.data)
            setTaskId(id)
            setAmount(amount)
            setTitle(title)
            setOptions(options)
        }).catch(err => console.log(err))
    }, [])
    console.log(options)
    return <div>
       {title &&  <h2>{title}</h2>} 
     {options?.map(option => (<Option taskId={option.task_id} key={option.id} image_url={option.image_url} 
     payableAmount = {payableAmout} 
     submitOption={async (e) => { 
        try { 
            const res = await axios.post('http://localhost:3000/v1/workers/submissions', { 
                taskId: String(option.task_id),
                selection: String(option.id)
            }, {headers: { 
                Authorization: `Bearer ${token}`
            }})
            if(res.data) { 
                console.log(res.data)
                if(res.data.nextTask) { 
                    const {id, amount, title, options } = res.data.nextTask;
                    console.log(res.data)
                    setTaskId(id)
                    setAmount(amount)
                    setTitle(title)
                    setOptions(options)
                } 
                if(res.data.amount) setPayableAmount(res.data.amount)
            }
        } catch(err) { 
            console.log(err);
        } 
     }}/> ))}
    </div>
}


function Option({taskId, image_url, payableAmount, submitOption}: { taskId: number, 
    image_url: string, 
    payableAmount: number,
    submitOption : (e:any) => void}) { 
    console.log(taskId)
    console.log(image_url)
    
    
    return (

        <div>
            <p className='font-bold text-2xl' >total payable amount: {payableAmount}</p> 
            <img src={image_url} alt="" onClick={(e) => submitOption(e)}/> 
        </div>
    )
}

