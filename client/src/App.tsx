import { useState, useEffect } from "react";

const useWebSocketConnection = () => {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [data, setData] = useState<string | null>(null);

  const onOpen = () => {
    console.log("Connected to WebSocket server");
  };

  const onClose = () => {
    console.log("Disconnected from WebSocket server");
  };

  const onMessage = (event: MessageEvent<string>) => {
    setData(event.data);
  };

  const connectWebSocket = () => {
    const socket = new WebSocket("ws://localhost:4000");

    socket.onopen = onOpen;
    socket.onclose = onClose;
    socket.onmessage = onMessage;

    setWebSocket(socket);
  };

  const disconnectWebSocket = () => {
    if (!webSocket) {
      return;
    }

    webSocket.close();
  };

  useEffect(() => {
    connectWebSocket();
    return disconnectWebSocket;
  }, []);

  return [webSocket, data] as const;
};

function App() {
  const [webSocket, data] = useWebSocketConnection();

  const voteOptions = ["Apple", "Banana", "Cherry", "Banana", "Watermelon"];
  const [option, setOption] = useState(voteOptions[0]);

  const handler = (event: React.FormEvent) => {
    event.preventDefault();
    if (!webSocket) {
      return;
    }

    webSocket.send(option);
  };

  return (
    <div>
      <h1>WebSocket React App</h1>
      {data && <p>{data}</p>}

      <form onSubmit={(e) => handler(e)}>
        <select value={option} onChange={(e) => setOption(e.target.value)}>
          {voteOptions.map((voteOption) => (
            <option key={voteOption} value={voteOption}>
              {voteOption}
            </option>
          ))}
        </select>
        <button type="submit">Send Vote</button>
      </form>
    </div>
  );
}

export default App;
