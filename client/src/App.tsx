import { useState, useEffect } from "react";

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selections, setSelections] = useState<{ [key: string]: number }>({});
  const fruits = ["apple", "banana", "pear"];

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket("ws://localhost:4000");

      socket.onopen = () => {
        console.log("Connected to WebSocket server");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const { type, data } = JSON.parse(event.data);
          if (type === "update") {
            setSelections(data);
          }
        } catch (error) {
          console.error("Invalid message format:", error);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected, attempting to reconnect...");
        setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
      };

      setWs(socket);
    };

    connectWebSocket();

    return () => {
      ws?.close();
    };
  }, [ws]);

  const sendVote = (fruit: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "vote", fruit }));
    }
  };

  return (
    <div>
      <h1>WebSocket React App</h1>
      <h2>Vote for Your Favorite Fruit</h2>
      {fruits.map((fruit) => (
        <div key={fruit}>
          <button onClick={() => sendVote(fruit)}>Vote {fruit}</button>
          <span> {selections[fruit] ?? 0} votes</span>
        </div>
      ))}
    </div>
  );
}

export default App;
