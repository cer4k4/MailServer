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
const express_1 = __importDefault(require("express"));
const connect_to_db_1 = __importDefault(require("./db/connect-to-db"));
const baseRouter_1 = __importDefault(require("./routes/baseRouter"));
const morgan_1 = __importDefault(require("morgan"));
const createAdmin_1 = require("./seeder/createAdmin");
const app = (0, express_1.default)();
// Body Parser
app.use(express_1.default.json(), express_1.default.urlencoded({ extended: false }));
// Request Logger
app.use((0, morgan_1.default)("dev"));
app.use("/", baseRouter_1.default);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, connect_to_db_1.default)();
    }
    catch (err) {
        console.log(err);
    }
    yield (0, createAdmin_1.addAdmin)();
});
start();
const port = 4000;
app.listen(port, () => {
    console.log(`TypeScript with Express 
         http://127.0.0.1:${port}/`);
});
