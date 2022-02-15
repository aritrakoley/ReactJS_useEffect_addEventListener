import { useEffect, useState } from "react";
import "./App.css";

let appRenderCounter = 0;
let childRenderCounter = 0;

function Child() {
  useEffect(() => {
    console.log('Child useEffect called');
    window.addEventListener("click", () => console.log("click"));
  }, []);
  
  childRenderCounter++;
  console.log(`Child component rendered ${childRenderCounter} time(s)`);
  return <div className="child">Child component rendered {childRenderCounter} time(s)</div>    
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
      <Child />
    </div>
  );
}

export default App;