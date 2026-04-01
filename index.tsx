import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Could not find root element with id 'root'");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Artemis II Mission Control: Dashboard initialized.");
  } catch (err) {
    console.error("Artemis II Mission Control: Bootstrap failure", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #f8fafc; background: #020617; font-family: 'JetBrains Mono', monospace; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <div style="border: 1px solid #ef4444; padding: 24px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); max-width: 600px;">
          <h2 style="color: #ef4444; margin-top: 0;">CRITICAL_BOOT_ERROR</h2>
          <p style="font-size: 14px; opacity: 0.8;">The Mission Control dashboard failed to initialize. This is usually due to a dependency resolution error or a missing API key environment variable.</p>
          <pre style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; text-align: left; border: 1px solid rgba(255,255,255,0.1);">${err instanceof Error ? err.stack || err.message : String(err)}</pre>
          <button onclick="window.location.reload()" style="margin-top: 16px; background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-family: inherit;">RETRY_UPLINK</button>
        </div>
      </div>
    `;
  }
}
