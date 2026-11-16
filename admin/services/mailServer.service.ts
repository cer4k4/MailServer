// services/mailServer.service.ts
import model from "../../shared/models/userSchema";
import { systemErrors, UserRoles } from "../../shared/models/enum"
import { hash, compare } from "bcrypt";
import { IUser } from "../../shared/models/user.interface";
import { ObjectId } from "mongodb";
import { execFile } from "child_process";
import { config } from "dotenv";
import { promisify } from "util";
import { configFile } from "../../config/config";

const execFileAsync = promisify(execFile);

class MailServerService {

  private async runSetup(args: string[]) {
    try {
      console.log("Docker path:", process.env.PATH);
      console.log("Docker API:", process.env.DOCKER_API_VERSION);

      const { stdout, stderr } = await execFileAsync(
        "/usr/bin/docker",
        [
          "exec",
          configFile.mailserver,
          "setup",
          ...args,
        ],
        {
          timeout: 30000,
        }
      );

      return {
        success: true,
        stdout,
        stderr,
      };

    } catch (error: any) {

      console.error("Mailserver command failed:", {
        args,
        stdout: error.stdout,
        stderr: error.stderr,
        message: error.message,
        code: error.code,
      });

      return {
        success: false,
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        error: error.message,
      };
    }
  }


  // private async runSetup(args: string[]) {
  //   try {
  //     const { stdout, stderr } = await execFileAsync(
  //       "docker",
  //       [
  //         "exec",
  //         configFile.mailserver,
  //         "setup",
  //         ...args,
  //       ],
  //       {
  //         timeout: 30000,
  //       }
  //     );

  //     return {
  //       success: true,
  //       stdout,
  //       stderr,
  //     };

  //   } catch (error: any) {

  //     console.error("Mailserver command failed:", {
  //       args,
  //       stdout: error.stdout,
  //       stderr: error.stderr,
  //       message: error.message,
  //     });

  //     return {
  //       success: false,
  //       stdout: error.stdout || "",
  //       stderr: error.stderr || "",
  //       error: error.message,
  //     };
  //   }
  // }

  async addEmail(email: string, password: string) {

    return this.runSetup([
      "email",
      "add",
      email,
      password,
    ]);
  }

  async updateEmail(email: string, password: string) {

    return this.runSetup([
      "email",
      "update",
      email,
      password,
    ]);
  }

  async deleteEmail(email: string) {

    return this.runSetup([
      "email",
      "del",
      email,
    ]);
  }

  async listEmails() {

    return this.runSetup([
      "email",
      "list",
    ]);
  }
  async SyncEmails() {
    const DEFAULT_PASSWORD = process.env.MAIL_SYNC_DEFAULT_PASSWORD;
    if (!DEFAULT_PASSWORD) {
      throw new Error("MAIL_SYNC_DEFAULT_PASSWORD is not set");
    }

    const domain = configFile.emailAddress;

  // ۱) لیست ایمیل‌های سرور => فقط username های همین دامنه
    const result = await this.listEmails();
    const serverUsernames = new Set<string>(
      (result.stdout as string)
        .split("\n")
        .map((line: string) => line.match(/^\*\s+(\S+)@(\S+?)\s/))
        .filter((m): m is RegExpMatchArray => m !== null)
        .filter((m) => m[2].toLowerCase() === domain)
        .map((m) => m[1].toLowerCase())
    );

    // ۲) username های Mongo
    const users = await model.UserModel.find({}, { username: 1 }).lean();
    const mongoUsernames = new Set<string>(
      users.map((u: any) => u.username?.toLowerCase()).filter(Boolean)
    );

    // ۳) یتیم‌ها: روی سرور هست، در Mongo نیست
    const orphans = [...serverUsernames].filter((u) => !mongoUsernames.has(u));

    const hashedDefault = await hash(DEFAULT_PASSWORD, 10);
    const defaultRole = /* نقش پیش‌فرض پروژه‌ات */ undefined;

    const synced: string[] = [];
    const failed: { username: string; reason: string }[] = [];

    for (const username of orphans) {
      try {
        await model.UserModel.create({
          username,
          fullName: username,
          password: hashedDefault,
          role: defaultRole,
        });

        const res = await this.updateEmail(
          `${username}@${configFile.emailAddress}`,
          DEFAULT_PASSWORD // خام به سرور
        );
        if (!res.success) throw new Error(res.stderr || "updateEmail failed");

        synced.push(username);
      } catch (err: any) {
        failed.push({ username, reason: err?.message ?? String(err) });
      }
    }
    return { synced, failed };
  }
}

async function checkRoles(role:string) {
  for (let r of Object(UserRoles).values){
    if (role === r) {
      return true
    }
  }
  return false
}



export default new MailServerService();
