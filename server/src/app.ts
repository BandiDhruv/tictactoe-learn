import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
const port=process.env.PORT;
const app:Express = express();
app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Servers");
  });
app.listen(port , ()=>{
    console.log(`Server is Running of at http://localhost:${port}`)
})
