// src/index.js
// Entry point — renders the App component into the HTML page.
// You normally don't need to touch this file.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
