"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = require("mongoose");
const enum_1 = require("./enum");
const baseModel_1 = __importDefault(require("./baseModel"));
const userSchema = new mongoose_1.Schema(Object.assign({ username: { type: String, required: true, unique: true }, fullName: { type: String }, role: { type: String, default: enum_1.UserRoles.USER, required: true }, email: { type: String }, password: { type: String, required: true } }, baseModel_1.default));
const UserModel = (0, mongoose_1.model)("User", userSchema);
module.exports = { UserModel };
