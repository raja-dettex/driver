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
exports.workerMiddleware = exports.authMiddleWare = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleWare = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'user is not authorized' });
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, config_1.USER_SECRET).userId;
        //@ts-ignore
        req.userId = userId;
        next();
        return;
    }
    res.status(401).json({ message: 'user is not authorized' });
    return;
});
exports.authMiddleWare = authMiddleWare;
const workerMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'user is not authorized' });
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, config_1.WORKER_SECRET).userId;
        //@ts-ignore
        req.userId = userId;
        next();
        return;
    }
    res.status(401).json({ message: 'user is not authorized' });
    return;
});
exports.workerMiddleware = workerMiddleware;
