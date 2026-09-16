import express from "express";
import getConnectionToDB from "./db/connect-to-db";
import baseRouter from "./routes/baseRouter";
import morgan from "morgan";
import { addAdmin } from "./seeder/createAdmin";
import { configFile } from "./config/config";

const app: express.Application = express();

// Body Parser
app.use(express.json(), express.urlencoded({ extended: false }));
// Request Logger
app.use(morgan("dev"));

app.use("/", baseRouter);

const start = async () => {
  try {
    await getConnectionToDB();
  } catch (err) {
    console.log(err);
  }
  await addAdmin()
};

start();

const port = configFile.hostPort;
const host = configFile.hostAddress;

app.listen(port, () => {
  console.log(`TypeScript with Express 
         http://0.0.0.0:${port}/`);
});
