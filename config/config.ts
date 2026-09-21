import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const configFile = {
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
