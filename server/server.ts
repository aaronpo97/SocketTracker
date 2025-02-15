import express from "express";
import http from "http";
import WebSocket from "ws";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

const selections = {
  apple: 0,
  banana: 0,
  pear: 0,
};

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send the current selections when a client connects
  ws.send(JSON.stringify({ type: "update", data: selections }));

  ws.on("message", (message: string) => {
    try {
      const { type, fruit }: { type: string; fruit: keyof typeof selections } =
        JSON.parse(message);

      if (type === "vote" && selections.hasOwnProperty(fruit)) {
        selections[fruit] += 1;

        // Broadcast updated selections to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "update", data: selections }));
          }
        });
      }
    } catch (error) {
      console.error("Invalid message format:", error);
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

app.get("/", (req, res) => {
  res.send("WebSocket server running");
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
