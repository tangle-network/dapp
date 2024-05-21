import '@webb-tools/webb-ui-components/tailwind.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const container =
  document.getElementById('root') ?? document.createElement('div');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
