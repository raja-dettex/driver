import { PrismaClient } from "@prisma/client";
import { Router, Request, Response, response } from "express";
import jwt from "jsonwebtoken";
import { Client } from "minio";
import { createTaskInput } from "../types";
import { authMiddleWare } from "../middlewares/auth.middleware";
import { USER_SECRET } from "../config";

const DEFAULT_TITLE = "find the best thumbnail with best click through rate"
export const MY_SECRET = "secret"
const minioClient = new Client({ 
    endPoint: 'bucket-production-37c8.up.railway.app',
    port: 443,
    useSSL: true,
    accessKey: 'tZkKoiCeE6b0U5sxDRKi',
    secretKey: 'z1NvxcJUcuHPKOG3z8Zo9jWbA4sjY0rjDSndX0jn'
})


async function generatePreSignedUrls(objectName: string, userId: string): Promise<string[]> { 
    const user = "user" + userId
    try { 
        minioClient
        const putUrl = await minioClient.presignedUrl('PUT', 'driver-buck', userId+  "/" + objectName, 24 * 60)
        const getUrl = await minioClient.presignedUrl('GET', 'driver-buck', userId+  "/" + objectName, 24 * 60)
        return [putUrl, getUrl]
    } catch(err) {
        console.log(err)
        throw err
    }
}


export const userRouter = Router()
const client = new PrismaClient()
userRouter.post('/signin', async (req: Request, res: Response) => { 
   const address = "jskdfffdsfsirshnsn"
    try { 
        const existingUser = await client.user.findUnique({
            where: { address: address}
        })
        if(existingUser) { 
            const token = jwt.sign({userId: existingUser.id}, USER_SECRET)
            res.status(200).json({token})
            return
        }
        const user = await client.user.create({
            data: { 
                address: address
            }
        })
        const token = jwt.sign({userId: user.id}, MY_SECRET)
        res.status(200).json({token})
        return
    } catch(error) { 
        if(error instanceof Error) res.status(400).json({message: error.message})
        return
    }
    
})

userRouter.get('/urls/:object', authMiddleWare,  async (req: Request, res: Response) => { 
    // @ts-ignore
    const userId = req.userId;
    const { object } = req.params;
    const urls = await generatePreSignedUrls(object, userId)
    res.json({urls: urls})
    return
})


userRouter.post('/tasks', authMiddleWare, async(req: Request, res: Response) => { 
    const parsedData = createTaskInput.safeParse(req.body)
    //@ts-ignore
    const userId = req.userId
    if(!parsedData.success) { 

    }
    try { 
        const task = await client.$transaction(async tx => { 
            const response = await tx.task.create({ data : { 
                title: parsedData.data?.title?? DEFAULT_TITLE,
                signature: parsedData.data?.signature ?? "", 
                amount: 1,
                user_id: userId
            }})

            const options = await tx.option.createMany({
                data: parsedData.data?.options.map(option => ({
                    image_url: option.imageUrl,
                    task_id: response.id                 
                })) ?? []
            })
            return response
        })
        res.status(201).json({id: task.id})
        return
    } catch(error) { 
        if(error instanceof Error) res.status(400).json({message: error.message})
        return
    }
})

userRouter.get("/task", authMiddleWare, async (req: Request, res: Response) => { 
    //@ts-ignore
    const userId = req.userId;

    const taskId = req.query.taskId
    try { 
        const taskDetails = await client.task.findFirst({
            where: { 
                user_id: Number(userId),
                id: Number(taskId)
            },
            include: { 
                options: true
            }
        })
        const result : Record<string, { 
            count: number,
            option: { imageUrl: string}
        }> = {}
        taskDetails?.options.forEach(option => { 
            result[option.id] = { count: 0, option: { imageUrl: option.image_url}}
        })

        const submissions = await client.submission.findMany({
            where: { task_id: Number(taskId)}
        })
        submissions.forEach(s=> {
            result[s.option_id].count++;
        })
        res.status(200).json({result, taskDetails})
        return
    } catch(err) { 
        console.log(err)
        if(err instanceof Error) res.status(400).json({message: err.message})
    }   
})