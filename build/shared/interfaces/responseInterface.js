"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponse = void 0;
const enum_1 = require("../models/enum");
class SuccessResponse {
    constructor(data, successfully = true, statusCode = 200, messae = enum_1.systemErrors.SUCCESSFUL) {
        this.successfully = successfully;
        this.data = data;
        this.statusCode = statusCode;
        this.message = messae;
    }
}
exports.SuccessResponse = SuccessResponse;
