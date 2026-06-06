import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  redisClient = createClient({ url });

  redisClient.on("error", (err) => {
    console.error("[BrandMate] Redis error:", err);
  });

  await redisClient.connect();
  return redisClient;
}
