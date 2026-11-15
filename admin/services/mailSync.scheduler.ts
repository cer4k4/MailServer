// services/mailSync.scheduler.ts

import { hash } from "bcrypt";
import model from "../../shared/models/userSchema";
import { configFile } from "../../config/config";
import mailServerService from "./mailServer.service";

const INTERVAL_MS = Number(process.env.MAIL_SYNC_INTERVAL_MS) || 10 * 60 * 1000;
const PRUNE = process.env.MAIL_SYNC_PRUNE === "true";
const IMPORT_MISSING = process.env.MAIL_SYNC_IMPORT === "true";
const DEFAULT_PASSWORD = process.env.MAIL_SYNC_DEFAULT_PASSWORD || "";
const PROTECTED = (process.env.MAIL_SYNC_PROTECTED || "postmaster@")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const DOMAIN = String(configFile.emailAddress).toLowerCase();

class MailSyncScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  start() {
    if (this.timer) return;
    console.log(
      `[MailSync] started, interval=${INTERVAL_MS}ms, import=${IMPORT_MISSING}, prune=${PRUNE}`
    );
    this.run();
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

  private async getMailEmails(): Promise<Set<string> | null> {
    const list = await mailServerService.listEmails();
    if (!list.success) {
      console.error("[MailSync] could not list mail accounts:", list.error);
      return null;
    }
    return this.parseMailList(list.stdout);
  }

  /** Periodic job: import missing users, then report/prune orphans. */
  async run() {
    if (this.running) {
      console.log("[MailSync] previous run still in progress, skipping");
      return;
    }
    this.running = true;

    try {
      const mailEmails = await this.getMailEmails();
      if (!mailEmails) return; // never act on a failed listing

      // 1) Mailbox exists but no Mongo user -> create Mongo user (same as registerUser)
      if (IMPORT_MISSING) {
        await this.importMissing(mailEmails);
      }

      // 2) Compare again after import
      const users = await model.UserModel.find({}, { email: 1 }).lean();
      const mongoEmails = new Set(
        users.map((u: any) => String(u.email || "").toLowerCase()).filter(Boolean)
      );

      const missingOnMail = [...mongoEmails].filter((e) => !mailEmails.has(e));
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

  /** Create Mongo users for mailboxes of our domain that have no user yet. */
  private async importMissing(mailEmails: Set<string>) {
    if (!DEFAULT_PASSWORD) {
      console.error("[MailSync] MAIL_SYNC_DEFAULT_PASSWORD is empty, skipping import");
      return;
    }
    const hashed = await hash(DEFAULT_PASSWORD, 10);

    for (const email of mailEmails) {
      const [username, domain] = email.split("@");
      if (domain !== DOMAIN || !username) continue; // skip other domains (e.g. example.ir)
      if (this.isProtected(email)) continue;

      const exists = await model.UserModel.findOne({ $or: [{ username }, { email }] });
      if (exists) continue;

      // Set the mail password first; if it fails, don't create the user (retried next run)
      const res = await mailServerService.updateEmail(email, DEFAULT_PASSWORD);
      if (!res.success) {
        console.error(`[MailSync] could not set mail password for ${email}, skipped:`, res.error);
        continue;
      }

      await model.UserModel.create({
        username,
        fullName: username,
        email,
        password: hashed,
      });
      console.log(`[MailSync] imported ${email} into Mongo`);
    }
  }

  /**
   * ONE-TIME manual operation: set the default password for ALL users of our domain,
   * in both Mongo (bcrypt hash) and the mail server. Do NOT call this from the interval.
   * Accounts in MAIL_SYNC_PROTECTED are skipped.
   */
  async resetAllPasswords() {
    if (!DEFAULT_PASSWORD) throw new Error("MAIL_SYNC_DEFAULT_PASSWORD is empty");

    const mailEmails = await this.getMailEmails();
    if (!mailEmails) return;

    const hashed = await hash(DEFAULT_PASSWORD, 10);

    for (const email of mailEmails) {
      const [username, domain] = email.split("@");
      if (domain !== DOMAIN || this.isProtected(email)) continue;

      const res = await mailServerService.updateEmail(email, DEFAULT_PASSWORD);
      if (!res.success) {
        console.error(`[MailSync] reset failed on mail server for ${email}:`, res.error);
        continue;
      }
      await model.UserModel.updateOne({ username }, { $set: { password: hashed } });
      console.log(`[MailSync] password reset for ${email}`);
    }
  }
}

export default new MailSyncScheduler();