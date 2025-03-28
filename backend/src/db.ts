import { PrismaClient } from "@prisma/client"
const client = new PrismaClient()
export const getNextTask = async ( userId: string) => { 
    const task = await client.task.findFirst({
        where: { 
            done: false,
            submissions:{
                none: { worker_id: Number(userId)}
            }
        },
        select: { id: true, amount: true , title: true, options: true}
    })   
    return task
    
}