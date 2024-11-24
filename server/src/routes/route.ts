import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import redisClient from "../config/redisClient";

const router: Router = Router();
router.get("/createRoom", (req: Request, res: Response) => {
    const roomId = uuidv4(); 
    res.send({ roomId }); 
});
router.get("/getState/:gameID",async (req:Request,res:Response)=>{
    const gameId=req.params.gameID;
    const gameState=await redisClient.get(`room:${gameId}`)
    if(gameState){
        console.log(JSON.parse(gameState ))
        res.send({"data":JSON.parse(gameState )})
    }else{
        res.send({"Error":"No game data present"})
    }
});
export default router;
