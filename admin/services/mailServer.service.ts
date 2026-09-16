// services/mailServer.service.ts

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
}

export default new MailServerService();