const Queue = require("bull");

const clickQueue = new Queue("clicks", {
  redis: {
    host: "127.0.0.1",
    port: 6379
  }
});

module.exports = clickQueue;