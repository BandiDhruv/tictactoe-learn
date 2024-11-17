import dotenv from "dotenv"; 
import express, { Express } from "express";
import appRoute from "./routes/route";
import cors from "cors"
dotenv.config();
const port = process.env.PORT || 5000;

const app: Express = express();

app.use(express.json());
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:5173', ] 
};
app.use(cors(corsOptions))
app.use("", appRoute);
app.listen(port, () => {
    console.log(`Server is Running at http://localhost:${port}`);
});
