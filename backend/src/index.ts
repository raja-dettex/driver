import express, { Request, Response} from 'express'
import { userRouter } from './router/user.router'
import { workerRouter } from './router/worker.router'
import cors from 'cors'


const app = express()
app.use(cors())
app.use(express.json())
app.use('/v1/users', userRouter)
app.use('/v1/workers', workerRouter)

app.listen(3000, () => console.log("listening"))