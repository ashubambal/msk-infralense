import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import KafkaDashboard from './KafkaDashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <KafkaDashboard />
  </React.StrictMode>
);
