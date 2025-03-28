import { PrismaClient, TxnStatus } from "@prisma/client";
import { Router , Request, Response } from "express";


const client = new PrismaClient()
import jwt, { JwtPayload} from 'jsonwebtoken'
import { JsonWebTokenError } from "jsonwebtoken";
import { TOTAL_DECIMALS, WORKER_SECRET } from "../config";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { workerMiddleware } from "../middlewares/auth.middleware";
export const workerRouter = Router()
const NO_OF_SUBMISSIONS = 50
workerRouter.post('/signin', async (req: Request, res: Response) => { 
     const address = "jskdfffdsfsirshnsn"
    try { 
        const existingUser = await client.worker.findUnique({
            where: { address: address}
        })
        if(existingUser) { 
            const token = jwt.sign({userId: existingUser.id}, WORKER_SECRET)
            res.status(200).json({token})
            return
        }
        const user = await client.worker.create({
            data: { 
                address: address,
                pending_amount: 0, 
                locked_amount: 0
            }
        })
        const token = jwt.sign({userId: user.id}, WORKER_SECRET)
        res.status(200).json({token})
        return
    } catch(error) { 
        if(error instanceof Error) res.status(400).json({message: error.message})
        return
    }
    
})

workerRouter.get('/nexttask', workerMiddleware, async(req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const taskId = req.query.taskId
    try { 
        // @ts-ignore
        const nextTask = await getNextTask(taskId, userId)
        res.status(200).json({nextTask})
    } catch(err) { 
        if(err instanceof Error) res.status(400).json({message: err.message})
    }
})

workerRouter.post('/submissions', workerMiddleware, async(req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const parsedData = createSubmissionInput.safeParse(req.body)
    if(!parsedData.success) { 
              
    }
    try { 
        // first find the task 
        const task = await getNextTask(userId);
        if(!task || task.id !== Number(parsedData.data?.taskId)) { 

        }
        if(task) { 
            const amount = (task?.amount/ NO_OF_SUBMISSIONS) * TOTAL_DECIMALS
            const submissions = await client.$transaction(async tx => { 
                await tx.submission.create({
                    data: { 
                        worker_id: Number(userId),
                        task_id: task?.id,
                        option_id: Number(parsedData.data?.selection),
                        amount : amount 
                    }
                })
                await tx.worker.update({
                    where: { id: Number(userId)},
                    data: { pending_amount: { increment: amount} } 
                })
            })
            const nextTask = await getNextTask(userId);
            res.json({
                nextTask,
                amount
            })
        } 
    } catch(err) { 
        
    }
})

workerRouter.get('/balance', workerMiddleware, async (req: Request, res: Response) => { 
    // @ts-ignore
    const userId = req.userId;
    try {
        const balances = await client.worker.findUnique({
            where: { id: userId},
            select: { pending_amount: true, locked_amount: true}
        })
        res.status(200).json({lockedAmount: balances?.locked_amount, pendingAmount: balances?.pending_amount})
        return
    } catch(err) { 
        if(err instanceof Error) res.status(400).json({messge: err.message})
        return
    }
})

workerRouter.post('/payouts', workerMiddleware, async (req: Request, res: Response) => { 
    // @ts-ignore
    const userId = req.userId;
    
    try {
        const worker = await client.worker.findUnique({where: { id: Number(userId)}})
        if(worker) { 
            await client.$transaction(async tx=> { 
                await tx.worker.update({
                    where: { id: worker.id},
                    data: { 
                        locked_amount: { 
                            increment: worker.pending_amount,
                        },
                        pending_amount: { 
                            decrement: worker.pending_amount
                        }
                    }
                })
                const signature = "4343wfww343w"
                await tx.payouts.create( { 
                    data: { 
                        user_id: worker.id,
                        amount: worker.pending_amount,
                        signature,
                        status: 'Processing'
                    }
                })
                
            })
            res.status(200).json({
                amount: worker.pending_amount,
                status: TxnStatus.Processing
            })
            return
        }
    } catch(err) { 
        if(err instanceof Error) res.status(400).json({messge: err.message})
        return
    }
})

