import express from "express";
import getConnectionToDB from "./db/connect-to-db";
import baseRouter from "./routes/baseRouter";
import morgan from "morgan";
import { addAdmin } from "./seeder/createAdmin";
import { configFile } from "./config/config";
import cors from "cors";

const app: express.Application = express();

// CORS Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://172.17.0.3:3000",
  "http://172.17.0.3:8080",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:80",
  "http://localhost:8080",
  "http://localhost:80",
  "http://94.101.185.186:3000",
  "http://94.101.185.186:80",
  "http://94.101.185.186:8080",
  configFile.hostAddress+":"+configFile.hostPort,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


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
