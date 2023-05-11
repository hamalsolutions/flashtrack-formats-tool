import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from "./tailwind.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);