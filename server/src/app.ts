import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import appRoute from "./routes/route";
import { startServer } from "./server/server";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors(corsOptions));

app.use("", appRoute);

startServer(app);
