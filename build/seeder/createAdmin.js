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
exports.addAdmin = addAdmin;
const userSchema_1 = __importDefault(require("../shared/models/userSchema"));
const config_1 = require("../config/config");
const bcrypt_1 = require("bcrypt");
const enum_1 = require("../shared/models/enum");
function addAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminFound = yield userSchema_1.default.UserModel.findOne({ "username": config_1.configFile.adminUsername });
            if (adminFound) {
                return;
            }
            const admin1 = {
                username: config_1.configFile.adminUsername || "",
                password: config_1.configFile.adminPassword || "",
                role: enum_1.UserRoles.ADMIN,
                userId: "",
                fullName: "Admin",
            };
            admin1.password = yield (0, bcrypt_1.hash)(String(admin1.password), 10);
            const result = yield userSchema_1.default.UserModel.create(admin1);
        }
        catch (err) {
            console.log("Erroor To Add Admin", err);
            return err;
        }
    });
}
