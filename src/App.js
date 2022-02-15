import { useEffect, useState } from "react";
import "./App.css";

let appRenderCounter = 0;
let childRenderCounter = 0;

function Child() {
  const [isActive, setIsActive] = useState(false);
  const handleClick = () => console.log("click");
  useEffect(() => {
    console.log("Child useEffect called");
    if (isActive) window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, [isActive]);

  childRenderCounter++;
  console.log(`Child component rendered ${childRenderCounter} time(s)`);
  return (
    <div className="child">
      <p>Child component rendered {childRenderCounter} time(s)</p>
      <button onClick={() => setIsActive(!isActive)}>Toggle Listener</button>
      <div className={`status ${isActive ? "on" : "off"}`}></div>
    </div>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(false);
  appRenderCounter++;
  console.log(`App component rendered ${appRenderCounter} time(s)`);
  return (
    <div className="app">
      <p>App component rendered {appRenderCounter} time(s)</p>
      <button onClick={() => setIsOnline(!isOnline)}>Toggle Status</button>
      <div className={`status ${isOnline ? "on" : "off"}`}></div>
      {isOnline? <Child /> : null}
    </div>
  );
}

export default App;