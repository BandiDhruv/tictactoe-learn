import { createClient } from "redis";

const redisClient = createClient({
    password: 'cKSVUkw25STVpFchvL8tzeadEbtdhoiE',
    socket: {
        host: 'redis-11351.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11351,
        connectTimeout:50000,
    },
  
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
