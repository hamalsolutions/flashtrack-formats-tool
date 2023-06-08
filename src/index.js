import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from "./tailwind.css";
import { enc, SHA256 } from "crypto-js";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

const AppContainer = () => {
  const [validCode, setValidCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [salt, setSalt] = useState("");

  useEffect(() => {
    const sharedKey = 'flastrack_create_labels' ; // Clave compartida entre ambas aplicaciones
    const newSalt = new URLSearchParams(window.location.search).get("salt") || "";
    const newCode = SHA256(sharedKey + newSalt).toString(enc.Hex);

    setGeneratedCode(newCode);
    setSalt(newSalt);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const receivedCode = urlParams.get("token"); 
    const isValid = receivedCode === generatedCode;

    setValidCode(isValid);
  }, [generatedCode]);

  // if (window !== window.top && validCode) {
    return (
      <React.StrictMode>
        <App salt={salt} />
      </React.StrictMode>
    );
  // } else {
  //   return null;
  // }
};

createRoot(document.getElementById('root')).render(<AppContainer />);
