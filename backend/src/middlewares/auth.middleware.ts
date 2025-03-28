import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { USER_SECRET, WORKER_SECRET } from "../config";
export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => { 
    const authHeader = req.headers['authorization']
    if(authHeader) { 
        const token = authHeader?.split(' ')[1]
        if(!token) { 
            res.status(401).json({message: 'user is not authorized'})
            return 
        }
        const userId = (jwt.verify(token, USER_SECRET) as JwtPayload).userId;
        //@ts-ignore
        req.userId = userId
        next()
        return
    } 
    res.status(401).json({message: 'user is not authorized'})
    return
}

export const workerMiddleware = async (req: Request, res: Response, next: NextFunction) => { 
    const authHeader = req.headers['authorization']
    if(authHeader) { 
        const token = authHeader?.split(' ')[1]
        if(!token) { 
            res.status(401).json({message: 'user is not authorized'})
            return 
        }
        const userId = (jwt.verify(token, WORKER_SECRET ) as JwtPayload).userId;
        //@ts-ignore
        req.userId = userId
        next()
        return
    } 
    res.status(401).json({message: 'user is not authorized'})
    return
}
