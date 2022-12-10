import './styles.css';
import '@webb-tools/webb-ui-components/tailwind.css';

import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
