"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
const express_validator_1 = require("express-validator");
const http_status_1 = __importDefault(require("http-status"));
const DataValidator = (req, res, next) => {
    let responseObject;
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        let err;
        let i = 1;
        for (let r of result.array()) {
            err = r.msg;
            i++;
        }
        responseObject = { message: err, statusCode: http_status_1.default.BAD_REQUEST, error: true, };
        return res.status(responseObject.statusCode).json(responseObject);
    }
    return next();
};
exports.DataValidator = DataValidator;
