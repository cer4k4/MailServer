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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../shared/models/userSchema"));
const enum_1 = require("../shared/models/enum");
const responseInterface_1 = require("../shared/interfaces/responseInterface");
var secretKey = "@dsf$sdsaxcxzxc213";
const Authorization = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const payload = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            for (let r of roles) {
                if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === r) {
                    return next();
                }
            }
            const response = new responseInterface_1.SuccessResponse({}, false, 403, enum_1.systemErrors.PERMISSIONDENIED);
            return res.status(403).json(response);
        }
        catch (err) {
            console.log("Server Error Authorization", err);
            next(err);
        }
    });
};
function Authentication(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.headers.authorization || "";
            if (!token) {
                const response = new responseInterface_1.SuccessResponse({}, false, 401, enum_1.systemErrors.TOKENNOTFOUNDED);
                return res.status(401).json(response);
            }
            const payload = jsonwebtoken_1.default.verify(token, secretKey);
            const userFound = yield userSchema_1.default.UserModel.findById(payload.userId);
            if (!userFound) {
                const response = new responseInterface_1.SuccessResponse({}, false, 404, enum_1.systemErrors.USERNOTFOUNDEDTOKEN);
                return res.status(404).json(response);
            }
            req.user = userFound;
            const requestWithUser = req;
            if (requestWithUser.user) {
                requestWithUser.user.userId = userFound.userId;
            }
            //newRequest.user.userId = user.id || ""
            // req.user.userId = user.id
            // req.payload.role = user.role
            return next();
        }
        catch (err) {
            console.log("Server Error Authentication", err);
            if (String(err) === "TokenExpiredError: jwt expired") {
                const response = new responseInterface_1.SuccessResponse({}, false, 400, enum_1.systemErrors.TOKENISEXPIRED);
                return res.status(400).json(response);
            }
            if (String(err) === "JsonWebTokenError: invalid token") {
                const response = new responseInterface_1.SuccessResponse({}, false, 400, enum_1.systemErrors.TOKENNOTVALEID);
                return res.status(400).json(response);
            }
            const response = new responseInterface_1.SuccessResponse(String(err), false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).json(response);
        }
    });
}
function generateToken(user) {
    const payload = {
        userId: user.userId,
        role: user.role
    };
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1h' });
}
module.exports = { Authentication, generateToken, Authorization };
