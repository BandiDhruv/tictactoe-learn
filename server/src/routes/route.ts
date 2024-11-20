import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const router: Router = Router();
router.get("/createRoom", (req: Request, res: Response) => {
    const roomId = uuidv4(); 
    res.send({ roomId }); 
});

export default router;
