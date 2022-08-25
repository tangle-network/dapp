import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { ThemeSwitcher } from './components';

export * from './components';

const App = () => <ThemeSwitcher />;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
