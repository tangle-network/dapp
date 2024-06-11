import '@webb-tools/webb-ui-components/tailwind.css';
import './styles.css';

import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<App />);
