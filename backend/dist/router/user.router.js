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
exports.userRouter = exports.MY_SECRET = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const minio_1 = require("minio");
const types_1 = require("../types");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const config_1 = require("../config");
const DEFAULT_TITLE = "find the best thumbnail with best click through rate";
exports.MY_SECRET = "secret";
const minioClient = new minio_1.Client({
    endPoint: 'bucket-production-37c8.up.railway.app',
    port: 443,
    useSSL: true,
    accessKey: 'tZkKoiCeE6b0U5sxDRKi',
    secretKey: 'z1NvxcJUcuHPKOG3z8Zo9jWbA4sjY0rjDSndX0jn'
});
function generatePreSignedUrls(objectName, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = "user" + userId;
        try {
            minioClient;
            const putUrl = yield minioClient.presignedUrl('PUT', 'driver-buck', userId + "/" + objectName, 3600);
            const getUrl = yield minioClient.presignedUrl('GET', 'driver-buck', userId + "/" + objectName, 3600);
            return [putUrl, getUrl];
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.userRouter = (0, express_1.Router)();
const client = new client_1.PrismaClient();
exports.userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = "jskdfffdsfsirshnsn";
    try {
        const existingUser = yield client.user.findUnique({
            where: { address: address }
        });
        if (existingUser) {
            const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, config_1.USER_SECRET);
            res.status(200).json({ token });
            return;
        }
        const user = yield client.user.create({
            data: {
                address: address
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, exports.MY_SECRET);
        res.status(200).json({ token });
        return;
    }
    catch (error) {
        if (error instanceof Error)
            res.status(400).json({ message: error.message });
        return;
    }
}));
exports.userRouter.get('/urls/:object', auth_middleware_1.authMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { object } = req.params;
    const urls = yield generatePreSignedUrls(object, userId);
    res.json({ urls: urls });
    return;
}));
exports.userRouter.post('/tasks', auth_middleware_1.authMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.createTaskInput.safeParse(req.body);
    //@ts-ignore
    const userId = req.userId;
    if (!parsedData.success) {
    }
    try {
        const task = yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const response = yield tx.task.create({ data: {
                    title: (_b = (_a = parsedData.data) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : DEFAULT_TITLE,
                    signature: (_d = (_c = parsedData.data) === null || _c === void 0 ? void 0 : _c.signature) !== null && _d !== void 0 ? _d : "",
                    amount: 1,
                    user_id: userId
                } });
            const options = yield tx.option.createMany({
                data: (_f = (_e = parsedData.data) === null || _e === void 0 ? void 0 : _e.options.map(option => ({
                    image_url: option.imageUrl,
                    task_id: response.id
                }))) !== null && _f !== void 0 ? _f : []
            });
            return response;
        }));
        res.status(201).json({ id: task.id });
        return;
    }
    catch (error) {
        if (error instanceof Error)
            res.status(400).json({ message: error.message });
        return;
    }
}));
exports.userRouter.get("/task", auth_middleware_1.authMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const taskId = req.query.taskId;
    try {
        const taskDetails = yield client.task.findFirst({
            where: {
                user_id: Number(userId),
                id: Number(taskId)
            },
            include: {
                options: true
            }
        });
        const result = {};
        taskDetails === null || taskDetails === void 0 ? void 0 : taskDetails.options.forEach(option => {
            result[option.id] = { count: 0, option: { imageUrl: option.image_url } };
        });
        const submissions = yield client.submission.findMany({
            where: { task_id: Number(taskId) }
        });
        submissions.forEach(s => {
            result[s.option_id].count++;
        });
        res.status(200).json({ result, taskDetails });
        return;
    }
    catch (err) {
        console.log(err);
        if (err instanceof Error)
            res.status(400).json({ message: err.message });
    }
}));
