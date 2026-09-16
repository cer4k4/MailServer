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
const userSchema_1 = __importDefault(require("../../shared/models/userSchema"));
const responseInterface_1 = require("../../shared/interfaces/responseInterface");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const enum_1 = require("../../shared/models/enum");
const bcrypt_1 = require("bcrypt");
const mongodb_1 = require("mongodb");
const config_1 = require("../../config/config");
const mailServer_service_1 = __importDefault(require("../services/mailServer.service"));
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const username = body.username;
            const userFound = yield userSchema_1.default.UserModel.findOne({ username });
            if (userFound) {
                const response = new responseInterface_1.SuccessResponse({}, false, 409, enum_1.systemErrors.USERNAMEEXISTED);
                return res.status(409).json(response);
            }
            const fullName = body.fullName;
            const password = body.password;
            const hashedPassword = yield (0, bcrypt_1.hash)(String(password), 10);
            const newUser = yield userSchema_1.default.UserModel.create({
                username,
                fullName,
                email: username + "@" + config_1.configFile.emailAddress,
                password: hashedPassword,
            });
            yield mailServer_service_1.default.addEmail(username + "@" + config_1.configFile.emailAddress, body.password);
            const response = new responseInterface_1.SuccessResponse({ username: newUser.username, fullName: newUser.fullName, role: newUser.role }, true, 201, enum_1.systemErrors.SUCCESSFUL);
            return res.status(201).json(response);
        }
        catch (error) {
            console.log("Server Error RegisterUser", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).json(response);
        }
    });
}
function updateUserByAdmin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params["userId"];
            const updateData = req.body;
            let user = yield userSchema_1.default.UserModel.findById(userId);
            if (!user) {
                const response = new responseInterface_1.SuccessResponse({}, false, 404, enum_1.systemErrors.USERNOTFOUNDED);
                return res.status(404).json(response);
            }
            if (updateData.newPassword) {
                const hashedPassword = yield (0, bcrypt_1.hash)(updateData.newPassword, 10);
                user.password = hashedPassword;
                yield mailServer_service_1.default.updateEmail(user.username + "@" + config_1.configFile.emailAddress, user.password);
            }
            if (updateData.username) {
                if (yield userSchema_1.default.UserModel.findOne({ username: updateData.username })) {
                    const response = new responseInterface_1.SuccessResponse({}, false, 409, enum_1.systemErrors.USERNAMEEXISTED);
                    return res.status(409).json(response);
                }
                user.username = updateData.username;
            }
            if (updateData.role) {
                if (!(yield checkRoles(updateData.role))) {
                    const response = new responseInterface_1.SuccessResponse({}, false, 404, enum_1.systemErrors.ROLENOTEXIST);
                    return res.status(404).json(response);
                }
                user.role = updateData.role;
            }
            if (updateData.fullName) {
                user.fullName = updateData.fullName;
            }
            const result = yield userSchema_1.default.UserModel.updateOne({ _id: user }, { $set: { username: user.username, fullName: user.fullName, password: user.password, role: user.role } });
            const response = new responseInterface_1.SuccessResponse(result);
            return res.status(200).json(response);
        }
        catch (error) {
            console.log("Server Error UpdateUserByAdmin", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).json(response);
        }
    });
}
function getUserByAdmin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params["userId"];
            const user = yield userSchema_1.default.UserModel.findById(id);
            if (!user) {
                const response = new responseInterface_1.SuccessResponse({}, false, 404, enum_1.systemErrors.USERNOTFOUNDED);
                return res.status(404).json(response);
            }
            else {
                const response = new responseInterface_1.SuccessResponse(user);
                return res.status(200).json(response);
            }
        }
        catch (error) {
            console.log("Server Error GetUserByAdmin", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).send(response);
        }
    });
}
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params["userId"];
            console.log("logggggggggg", id);
            const user = yield userSchema_1.default.UserModel.findByIdAndDelete(id);
            if (!user) {
                const response = new responseInterface_1.SuccessResponse({}, false, 404, enum_1.systemErrors.USERNOTFOUNDED);
                return res.status(404).json(response);
            }
            else {
                const userRes = new responseInterface_1.SuccessResponse(user);
                yield mailServer_service_1.default.deleteEmail(userRes.data.email);
                return res.status(200).json(userRes);
            }
        }
        catch (error) {
            console.log("Server Error DeleteUser", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).send(response);
        }
    });
}
function allUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let limit = Number(req.params["limit"]);
            if (!limit || limit <= 0) {
                limit = Number(10);
            }
            let page = Number(req.params["page"]);
            if (!page || page <= 0) {
                page = Number(1);
            }
            const offset = (page - 1) * limit;
            const allUsers = yield userSchema_1.default.UserModel.find({}).skip(offset).limit(limit);
            const response = new responseInterface_1.SuccessResponse(allUsers);
            return res.status(200).json(response);
        }
        catch (error) {
            console.log("Server Error AllUser", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).send(response);
        }
    });
}
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updateData = req.body;
            const user = (req.user);
            if (updateData.newPassword) {
                if (!(yield (0, bcrypt_1.compare)(updateData.password, user.password))) {
                    const response = new responseInterface_1.SuccessResponse({}, false, 400, enum_1.systemErrors.PASSWORDWRONG);
                    return res.status(400).json(response);
                }
                const hashedPassword = yield (0, bcrypt_1.hash)(updateData.newPassword, 10);
                user.password = hashedPassword;
            }
            if (updateData.username) {
                if (yield userSchema_1.default.UserModel.findOne({ username: updateData.username })) {
                    const response = new responseInterface_1.SuccessResponse({}, false, 409, enum_1.systemErrors.USERNAMEEXISTED);
                    return res.status(409).json(response);
                }
                user.username = updateData.username;
            }
            user.fullName = updateData.fullName;
            let id = new mongodb_1.ObjectId(user.userId);
            const result = yield userSchema_1.default.UserModel.updateOne({ _id: id }, { $set: { username: user.username, fullName: user.fullName, password: user.password } });
            const response = new responseInterface_1.SuccessResponse(result, true, 200, enum_1.systemErrors.UPDATESUCCESSFUL);
            return res.status(200).json(response);
        }
        catch (error) {
            console.log("Server Error UpdateUser", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).json(response);
        }
    });
}
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const response = new responseInterface_1.SuccessResponse({ "username": user.username, "fullName": user.fullName });
            return res.status(200).json(response);
        }
        catch (error) {
            console.log("Server Error GetUser", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).json(response);
        }
    });
}
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const username = req.body.username || '';
            const password = req.body.password || '';
            const userFound = yield userSchema_1.default.UserModel.findOne({ username });
            if (!userFound) {
                const response = new responseInterface_1.SuccessResponse({}, false, 404, enum_1.systemErrors.USERNOTFOUNDED);
                return res.status(404).json(response);
            }
            if (!(0, bcrypt_1.compare)(password, userFound.password)) {
                const response = new responseInterface_1.SuccessResponse({}, false, 400, enum_1.systemErrors.PASSWORDWRONG);
                return res.status(400).json(response);
            }
            const user = {
                userId: userFound.id,
                username: username,
                password: password,
                role: enum_1.UserRoles.USER,
                fullName: userFound.fullName,
            };
            const response = new responseInterface_1.SuccessResponse(authentication_middleware_1.default.generateToken(user));
            return res.json(response);
        }
        catch (error) {
            console.log("Server Error LoginUser", error);
            const response = new responseInterface_1.SuccessResponse({}, false, 500, enum_1.systemErrors.SERVERERROR);
            return res.status(500).json(response);
        }
    });
}
function checkRoles(role) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let r of Object(enum_1.UserRoles).values) {
            if (role === r) {
                return true;
            }
        }
        return false;
    });
}
module.exports = { getUserByAdmin, updateUserByAdmin, deleteUser, allUser, getUser, registerUser, updateUser, loginUser };
