import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Cardano/Lucid Polyfills
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
import process from 'process';
(window as any).process = process;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
