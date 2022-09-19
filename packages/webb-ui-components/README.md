# How to use

First, import the `tailwind.css` file and the `WebbUIProvider` into `index.tsx`

```tsx
// src/index.tsx
import '@webb-dapp/webb-ui-components/tailwind.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { WebbUIProvider } from '@webb-dapp/webb-ui-components/provider';

import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <WebbUIProvider>
      <App />
    </WebbUIProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

Then, you can use the components in your app

```tsx
import { Button } from '@webb-dapp/webb-ui-components';

const App: React.FC = () => {
  return <Button>Click me</Button>;
};
```
