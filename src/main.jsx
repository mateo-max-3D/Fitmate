import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FitmateProvider } from './context/FitmateContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FitmateProvider>
      <App />
    </FitmateProvider>
  </React.StrictMode>
);
