"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_router_1 = require("./router/user.router");
const worker_router_1 = require("./router/worker.router");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/v1/users', user_router_1.userRouter);
app.use('/v1/workers', worker_router_1.workerRouter);
app.listen(3000, () => console.log("listening"));
