// services/mailSync.scheduler.ts

import model from "../../shared/models/userSchema";
import mailServerService from "./mailServer.service";

const INTERVAL_MS = Number(process.env.MAIL_SYNC_INTERVAL_MS) || 10 * 60 * 1000; // 10 min
const PRUNE = process.env.MAIL_SYNC_PRUNE === "true"; // delete mail-only accounts (default: off)
const PROTECTED = (process.env.MAIL_SYNC_PROTECTED || "postmaster@")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean); // prefixes/addresses never deleted

class MailSyncScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false; // prevents overlapping runs

  start() {
    if (this.timer) return;
    console.log(`[MailSync] started, interval=${INTERVAL_MS}ms, prune=${PRUNE}`);
    this.run(); // run once at startup
    this.timer = setInterval(() => this.run(), INTERVAL_MS);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  // docker-mailserver prints lines like: "* user@domain.com ( 12K / ~ ) [0%]"
  private parseMailList(stdout: string): Set<string> {
    const emails = new Set<string>();
    for (const line of stdout.split("\n")) {
      const match = line.match(/^\s*\*\s+(\S+@\S+)/);
      if (match) emails.add(match[1].toLowerCase());
    }
    return emails;
  }

  private isProtected(email: string) {
    return PROTECTED.some((p) => email === p || email.startsWith(p));
  }

  async run() {
    if (this.running) {
      console.log("[MailSync] previous run still in progress, skipping");
      return;
    }
    this.running = true;

    try {
      const list = await mailServerService.listEmails();
      if (!list.success) {
        console.error("[MailSync] could not list mail accounts, aborting:", list.error);
        return; // never prune on a failed/partial listing
      }

      const mailEmails = this.parseMailList(list.stdout);

      const users = await model.UserModel.find({}, { email: 1 }).lean();
      const mongoEmails = new Set(
        users.map((u: any) => String(u.email || "").toLowerCase()).filter(Boolean)
      );

      // In Mongo but missing on the mail server.
      // Can't be recreated: Mongo only stores a bcrypt hash and `setup email add` needs the plaintext.
      const missingOnMail = [...mongoEmails].filter((e) => !mailEmails.has(e));

      // On the mail server but not in Mongo (orphans).
      const orphans = [...mailEmails].filter((e) => !mongoEmails.has(e) && !this.isProtected(e));

      if (missingOnMail.length) {
        console.warn(`[MailSync] ${missingOnMail.length} Mongo user(s) have no mailbox:`, missingOnMail);
      }

      if (orphans.length) {
        if (!PRUNE) {
          console.warn(`[MailSync] ${orphans.length} orphan mailbox(es) (prune disabled):`, orphans);
        } else {
          for (const email of orphans) {
            const res = await mailServerService.deleteEmail(email);
            console.log(`[MailSync] delete ${email}: ${res.success ? "ok" : "FAILED " + res.error}`);
          }
        }
      }

      console.log(
        `[MailSync] done. mongo=${mongoEmails.size} mail=${mailEmails.size} ` +
          `missingOnMail=${missingOnMail.length} orphans=${orphans.length}`
      );
    } catch (error) {
      console.error("[MailSync] unexpected error:", error);
    } finally {
      this.running = false;
    }
  }
}

export default new MailSyncScheduler();