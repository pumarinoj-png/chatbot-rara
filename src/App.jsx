import { useState } from "react";
import Menu from "./components/Menu";
import Chat from "./components/Chat";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [method, setMethod] = useState(null);
  const [attitude, setAttitude] = useState(null);

  const handleStart = (selectedMethod, selectedAttitude) => {
    setMethod(selectedMethod);
    setAttitude(selectedAttitude);
    setScreen("chat");
  };

  const handleReset = () => {
    setScreen("menu");
    setMethod(null);
    setAttitude(null);
  };

  return (
    <div className="app">
      {screen === "menu" && <Menu onStart={handleStart} />}
      {screen === "chat" && (
        <Chat method={method} attitude={attitude} onReset={handleReset} />
      )}
    </div>
  );
}
