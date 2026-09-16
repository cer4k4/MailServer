"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = void 0;
const express_validator_1 = require("express-validator");
exports.UpdateUserDto = [
    (0, express_validator_1.body)("username")
        .optional()
        .trim()
        .isString()
        .withMessage("نام کاربری باید رشته باشد")
        .isAlphanumeric("en-US")
        .withMessage("نام کاربری شامل حروف انگلیسی و اعداد می باشد")
        .isLength({ min: 4, max: 20 })
        .withMessage("حداقل طول نام کاربری ۴ و حداکثر ۲۰ کاراکتر می باشد")
        .toLowerCase(),
    (0, express_validator_1.body)("newPassword")
        .optional()
        .isString()
        .withMessage("رمز عبور جدید باید رشته باشد")
        .isLength({ min: 8, max: 32 })
        .withMessage("حداقل طول رمز عبور جدید باید ۸ کاراکتر باشد")
        .isStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
    })
        .withMessage("رمز عبور جدید باید شامل حروف بزرگ و کوچک انگلیسی و نماد ها باشد"),
    (0, express_validator_1.body)("fullName")
        .optional()
        .trim()
        .isString()
        .withMessage("نام باید رشته باشد")
        .isLength({ min: 3, max: 32 })
        .withMessage("حداقل طول نام ۳ و حداکثر ۳۲ کاراکتر می باشد"),
    (0, express_validator_1.body)("role")
        .optional()
        .trim()
        .isString()
        .withMessage("نقش باید رشته باشد")
        .isLength({ min: 4, max: 15 })
        .withMessage("حداقل طول نقش ۴ و حداکثر ۱۵ کاراکتر می باشد"),
];
