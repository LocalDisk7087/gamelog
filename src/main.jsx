import 'bootstrap/dist/css/bootstrap.min.css'; 
// Based on the doc, all other imports should be below this line
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // not sure if I should keep this or not, need to decide later

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);