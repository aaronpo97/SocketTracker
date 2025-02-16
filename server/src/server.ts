import express from "express";
import http from "http";
import WebSocket from "ws";
import cors from "cors";
import Redis from "ioredis";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// Create a Redis client
const redis = new Redis({
  host: "localhost",
  port: 6379,
});
app.use(cors());

const getRedisData = async () => {
  const votes = await redis.hgetall("votes");
  const connections = wss.clients.size;
  return { votes, connections };
};
// WebSocket connection handler

wss.on("connection", async (ws) => {
  // Send the current selections when a client connects
  ws.send(JSON.stringify({ type: "update", data: await getRedisData() }));
  ws.on("message", async (message) => {
    // Increment the connection count
    await redis.hincrby("votes", message.toString(), 1);
    wss.clients.forEach(async (client) => {
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }

      client.send(
        JSON.stringify({ type: "update", data: await getRedisData() })
      );
    });
  });

  ws.on("close", () => {});
});

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

server.listen(4000, () => {
  // delete all keys in the Redis database\
  redis.flushall();
  console.log("Server running on http://localhost:4000");
});
