import "./App.css";

let renderCounter = 0;
function App() {

  window.addEventListener('click', () => console.log('click') );

  renderCounter++;
  console.log(`App component rendered ${renderCounter} time(s)`);
  return <div className="app">App component rendered {renderCounter} time(s)</div>;
}

export default App;