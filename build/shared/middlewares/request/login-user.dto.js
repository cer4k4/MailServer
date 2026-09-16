"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserDto = void 0;
const express_validator_1 = require("express-validator");
exports.LoginUserDto = [
    (0, express_validator_1.body)("username")
        .trim()
        .isString()
        .withMessage("نام کاربری باید رشته باشد")
        .isAlphanumeric("en-US")
        .withMessage("نام کاربری شامل حروف انگلیسی و اعداد می باشد")
        .isLength({ min: 4, max: 20 })
        .withMessage("حداقل طول نام کاربری ۴ و حداکثر ۲۰ کاراکتر می باشد")
        .toLowerCase(),
    (0, express_validator_1.body)("password")
        .isString()
        .withMessage("رمز عبور باید رشته باشد")
        .isLength({ min: 4, max: 32 })
];
