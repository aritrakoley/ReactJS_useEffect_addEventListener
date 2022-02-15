import { useState } from "react";
import "./App.css";

let renderCounter = 0;
function App() {
  const [isOnline, setIsOnline] = useState(false);
  window.addEventListener("click", () => console.log("click"));

  renderCounter++;
  console.log(`App component rendered ${renderCounter} time(s)`);
  return (
    <div className="app">
      <p>App component rendered {renderCounter} time(s)</p>
      <button onClick={() => setIsOnline(!isOnline)}>Toggle Status</button>
      <div className={`status ${isOnline ? "on" : "off"}`}></div>
    </div>
  );
}

export default App;