import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [stateToggle, setStateToggle] = useState(false);

  useEffect(() => {
    // 1. Declare callback
    const handleClick = () => {
      console.log("window click");
    };

    // 2. Attach the event-listener
    window.addEventListener("click", handleClick);

    // 3. Clean up: Remove the event-listener
    return () => window.removeEventListener("click", handleClick);
    },
    // 4. Fill dependency array with other dependencies
    [stateToggle]
  );

  return (
    <button onClick={(e) => setStateToggle(!stateToggle)}>
      State: {stateToggle.toString()}
    </button>
  );
}

export default App;