"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamUserIdDto = void 0;
const express_validator_1 = require("express-validator");
exports.ParamUserIdDto = [
    (0, express_validator_1.param)("userId")
        .isMongoId()
        .withMessage("فرمت آیدی وارد شده صحیح نمیباشد"),
];
