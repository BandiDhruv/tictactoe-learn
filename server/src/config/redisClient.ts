import { createClient } from "redis";
import dotenv from "dotenv"
dotenv.config()

// console.log(process.env.REDIS_PASSWORD)
const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST ,
        port: 11351,
        connectTimeout:50000,
    },
  
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
