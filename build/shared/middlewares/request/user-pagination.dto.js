"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamGetAllUserDto = void 0;
const express_validator_1 = require("express-validator");
exports.ParamGetAllUserDto = [
    (0, express_validator_1.param)("page")
        .isInt({ gt: 0 })
        .withMessage("page  => (پارامتر باید دامنه اعداد طبیعی باشد) فرمت پارامتر وارد شده صحیح نمیباشد"),
    (0, express_validator_1.param)("limit")
        .isInt({ gt: 0, max: 100 })
        .withMessage(`همچنین کمتر از ۱۰۰باشد <= limit | limit =>  (پارامتر باید دامنه اعداد طبیعی باشد) فرمت پارامتر وارد شده صحیح نمیباشد`),
];
