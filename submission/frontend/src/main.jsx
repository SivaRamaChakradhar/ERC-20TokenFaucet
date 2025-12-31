import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./utils/eval";


if (window.location.pathname === "/health") {
  document.body.innerHTML = "OK";
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
