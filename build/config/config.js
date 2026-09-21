"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configFile = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
exports.configFile = {
    "adminUsername": process.env.ADMIN_USERNAME,
    "adminPassword": process.env.ADMIN_PASSWORD,
    "hostAddress": process.env.HOST_ADDRESS,
    "hostPort": process.env.HOST_PORT,
    "dbHost": process.env.DB_HOST,
    "dbName": process.env.DB_NAME,
    "dbPort": process.env.DB_PORT,
    "emailAddress": process.env.EMAIL_ADDRESS,
    "mailserver": process.env.MAILSERVER_CONTAINER || "mailserver",
    "uri": `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/`,
};
