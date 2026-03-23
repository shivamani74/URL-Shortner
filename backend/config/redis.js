const IORedis = require("ioredis");

const redisClient = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null
});

redisClient.on("connect", () => {
  console.log("Redis Connected");
});

module.exports = redisClient;