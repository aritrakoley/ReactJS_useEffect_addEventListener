# Handling Event Listeners inside useEffect Hooks in React
> **Note:** React v17.0.2 is used in the examples.

The reasoning behind some of the best practices when it comes to using `event.addEventListener(...)` in React was not straight forward to me at first. This article is a way for me to keep a note of what I learnt and help out anyone who might be seeking the same knowledge.

## TL;DR
This section is for the ones who just want some working code and are not concerned with why it's written the way it is.  
>I am using the `window` element since most common use cases for any inner child of `window` are covered by using the built-in [event handlers](https://reactjs.org/docs/hooks-effect.html) in React like `onClick`, `onMouseOver`, etc.
>
> For example,  
`<button onClick={() => console.log("clicked")}>Click Me!</button>`

```jsx
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

```

The above code has the following parts:  
1. Declare the `handleClick` separately since we need to send the same reference to both `addEventListener()`, `removeEventListener()` as the second argument.
2. Attach the event listener using `addEventListener()`. Here, we just use a click-listener.
3. If there is an event-listener being attached inside the `useEffect` hook, in most cases we need to add clean-up code that removes the event-listener.<br/>This prevents more than one click listener being attached to `window` at a time. If the clean-up code were not present, every time App component's useEffect is run a new event-listener would have been attached to `window` and a single click on `window` would call multiple instances of handleClick.<br />(Try this out by commenting out the `return` statement and then running then running the code. Click the State button a few times then click anywhere else on the page.)
4. The dependency array is populated to prevent useEffect being run on every render. The contents of the dependency array will vary based on the use case.

## A Deeper Dive
### Part One
The goal is to print "clicked" to console every time user clicks on anywhere within the `window` element.  

So we start by adding the the event-listener for 'click' events directly inside the App component.  
(Spoiler: Bad idea. New listener attached on every render.)

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

```jsx
// App.js
import "./App.css";

let renderCounter = 0;
function App() {

  window.addEventListener('click', () => console.log('click') );

  renderCounter++;
  console.log(`App component rendered ${renderCounter} time(s)`);
  return <div className="app">App component rendered {renderCounter} time(s)</div>;
}

export default App;
```

> **Note:** If you're using create-react-app and have not disabled [StrictMode](https://reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects), you'll see `console.log()` run only once but everything else in functional component's body will actually run twice. This is because of some React 17's special behavior for `console` functions. The body actually runs twice when StrictMode is enabled.

With the above code, everything works fine but, when working on real-world projects, code is rarely this simple. A change of state within App component could cause it to re-render and add another event-listener to the `window` element.

```jsx
// App.js
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
```

```css
/* App.css */
div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 2px
}

.app {
  width: 500px;
  height: 500px;
  background-color: pink;
}

.status {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.on {
  background-color: green;
}

.off {
  background-color: red;
}
```

Everything else remains the same.  
Now every time the "Toggle Status" button is clicked, a new event-listener is being attached to window. So, if we toggled n times, n listeners are being triggered per click on window. You can see this in the console. This can quickly get unmanageable.

### Part Two
To get finer control over when listeners are attached and when they are removed, we put them inside useEffect hooks. In the following code snippet, I just wrap the `window.addEventListener("click", () => console.log("click"));` line inside a useEffect hook, keeping everything else unchanged.

```jsx
import { useEffect, useState } from "react";
import "./App.css";

let renderCounter = 0;
function App() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    console.log('App useEffect called');
    window.addEventListener("click", () => console.log("click"));
  });
  
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
```

This does not solve our problem as useEffect without a dependency array will just be called at every render like in our previous example. We just need one event listener attached right at the first render and any subsequent state changes / re-renders of App component should not effect our listener. To achieve this we add and empty array as dependency.

```jsx
useEffect(() => {
    window.addEventListener("click", () => console.log("click"));
  }, []);
```

This makes useEffect run only once when App is being mounted and our app seems to be working fine now.  
Here's the catch. We've been working with the App component which is the root component which is not re-mounted very often for most use cases. So we were able to get away with sloppy code.

### Part Three
Now let's add a child component of App component which attaches the actual event-listener to the window element.
```jsx
// App.js
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
```
In the above code, what we've done is move the useEffect hook that attaches the event listener inside the child component. In its current state, the code will work fine since the child's useEffect runs after the first render but not subsequent ones (empty dependency array).  
In the next step, we put in a mechanism to unmount and remount the child, forcing the child's useEffect to be called.  
It's as simple as replacing `<Child />` with `{isOnline? <Child /> : null}`.

```jsx
// App.js
/* code above */
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
/* code below */
```

Well, now we are reunited with our old problem of unintentionally adding multiple event-listeners.
Time to clean up our act. Lets add the clean-up code. We need to separate out the function for handling the click so that we can send the same reference to both  `addEventListener`, `removeEventListener`.
```jsx
// App.js
/* code above */
function Child() {
  const handleClick = () => console.log("click");
  useEffect(() => {
    console.log("Child useEffect called");
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  childRenderCounter++;
  console.log(`Child component rendered ${childRenderCounter} time(s)`);
  return <div className="child">Child component rendered {childRenderCounter} time(s)</div>
}
/* code below */
```

Now, as long as the child is visible, the listener will be active but before the child is re-mounted, the previous listener will be removed and a new one added.

### Part Four
Consider the use case where we don't need to have a click listener just because the child is rendered. We have some separate logic that determines whether the listener should be active inside the child component.  
For example, let the child have a state of its own called `isActive`.
```jsx
// App.js
/* code above */
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
/* code below */
```

Obviously, this article does not contain examples of all use cases but maybe these ones help in furthering your understanding of how useEffect and addEventListener work together.

Useful Links:
1. [React useEffect Docs](https://reactjs.org/docs/hooks-effect.html)
2. [React Event Handling Docs](https://reactjs.org/docs/hooks-effect.html)
3. [Event Capturing and Bubbling](https://www.youtube.com/watch?v=XF1_MlZ5l6M)