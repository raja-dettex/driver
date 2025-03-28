"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const client = new client_1.PrismaClient();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const db_1 = require("../db");
const types_1 = require("../types");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.workerRouter = (0, express_1.Router)();
const NO_OF_SUBMISSIONS = 50;
exports.workerRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = "jskdfffdsfsirshnsn";
    try {
        const existingUser = yield client.worker.findUnique({
            where: { address: address }
        });
        if (existingUser) {
            const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, config_1.WORKER_SECRET);
            res.status(200).json({ token });
            return;
        }
        const user = yield client.worker.create({
            data: {
                address: address,
                pending_amount: 0,
                locked_amount: 0
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.WORKER_SECRET);
        res.status(200).json({ token });
        return;
    }
    catch (error) {
        if (error instanceof Error)
            res.status(400).json({ message: error.message });
        return;
    }
}));
exports.workerRouter.get('/nexttask', auth_middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const taskId = req.query.taskId;
    try {
        // @ts-ignore
        const nextTask = yield (0, db_1.getNextTask)(taskId, userId);
        res.status(200).json({ nextTask });
    }
    catch (err) {
        if (err instanceof Error)
            res.status(400).json({ message: err.message });
    }
}));
exports.workerRouter.post('/submissions', auth_middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // @ts-ignore
    const userId = req.userId;
    const parsedData = types_1.createSubmissionInput.safeParse(req.body);
    if (!parsedData.success) {
    }
    try {
        // first find the task 
        const task = yield (0, db_1.getNextTask)(userId);
        if (!task || task.id !== Number((_a = parsedData.data) === null || _a === void 0 ? void 0 : _a.taskId)) {
        }
        if (task) {
            const amount = ((task === null || task === void 0 ? void 0 : task.amount) / NO_OF_SUBMISSIONS) * config_1.TOTAL_DECIMALS;
            const submissions = yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                yield tx.submission.create({
                    data: {
                        worker_id: Number(userId),
                        task_id: task === null || task === void 0 ? void 0 : task.id,
                        option_id: Number((_a = parsedData.data) === null || _a === void 0 ? void 0 : _a.selection),
                        amount: amount
                    }
                });
                yield tx.worker.update({
                    where: { id: Number(userId) },
                    data: { pending_amount: { increment: amount } }
                });
            }));
            const nextTask = yield (0, db_1.getNextTask)(userId);
            res.json({
                nextTask,
                amount
            });
        }
    }
    catch (err) {
    }
}));
exports.workerRouter.get('/balance', auth_middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    try {
        const balances = yield client.worker.findUnique({
            where: { id: userId },
            select: { pending_amount: true, locked_amount: true }
        });
        res.status(200).json({ lockedAmount: balances === null || balances === void 0 ? void 0 : balances.locked_amount, pendingAmount: balances === null || balances === void 0 ? void 0 : balances.pending_amount });
        return;
    }
    catch (err) {
        if (err instanceof Error)
            res.status(400).json({ messge: err.message });
        return;
    }
}));
exports.workerRouter.post('/payouts', auth_middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    try {
        const worker = yield client.worker.findUnique({ where: { id: Number(userId) } });
        if (worker) {
            yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                yield tx.worker.update({
                    where: { id: worker.id },
                    data: {
                        locked_amount: {
                            increment: worker.pending_amount,
                        },
                        pending_amount: {
                            decrement: worker.pending_amount
                        }
                    }
                });
                const signature = "4343wfww343w";
                yield tx.payouts.create({
                    data: {
                        user_id: worker.id,
                        amount: worker.pending_amount,
                        signature,
                        status: 'Processing'
                    }
                });
            }));
            res.status(200).json({
                amount: worker.pending_amount,
                status: client_1.TxnStatus.Processing
            });
            return;
        }
    }
    catch (err) {
        if (err instanceof Error)
            res.status(400).json({ messge: err.message });
        return;
    }
}));
