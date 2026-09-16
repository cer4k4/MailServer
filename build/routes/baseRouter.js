"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const adminRouter_1 = __importDefault(require("../admin/adminRoutes/adminRouter"));
const baseRouter = express_1.default.Router();
baseRouter.use("/admin", adminRouter_1.default);
module.exports = baseRouter;
