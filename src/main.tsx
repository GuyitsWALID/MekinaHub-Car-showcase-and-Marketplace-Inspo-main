import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";  
import { AuthProvider } from "./contexts/AuthContext";  // ← adjust path as needed
import { StrictMode } from "react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <AuthProvider>
      
        <App />
      
    </AuthProvider>
  </StrictMode>
);