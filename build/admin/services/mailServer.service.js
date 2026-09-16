"use strict";
// services/mailServer.service.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const config_1 = require("../../config/config");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class MailServerService {
    runSetup(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { stdout, stderr } = yield execFileAsync("docker", [
                    "exec",
                    config_1.configFile.mailserver,
                    "setup",
                    ...args,
                ], {
                    timeout: 30000,
                });
                return {
                    success: true,
                    stdout,
                    stderr,
                };
            }
            catch (error) {
                console.error("Mailserver command failed:", {
                    args,
                    stdout: error.stdout,
                    stderr: error.stderr,
                    message: error.message,
                });
                return {
                    success: false,
                    stdout: error.stdout || "",
                    stderr: error.stderr || "",
                    error: error.message,
                };
            }
        });
    }
    addEmail(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runSetup([
                "email",
                "add",
                email,
                password,
            ]);
        });
    }
    updateEmail(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runSetup([
                "email",
                "update",
                email,
                password,
            ]);
        });
    }
    deleteEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runSetup([
                "email",
                "del",
                email,
            ]);
        });
    }
    listEmails() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runSetup([
                "email",
                "list",
            ]);
        });
    }
}
exports.default = new MailServerService();
