// .storybook/manager.js

import { addons } from '@storybook/addons';
import webbTheme from './webbTheme.js';
import favicon from '../src/stories/assets/favicon.png';

addons.setConfig({
  theme: webbTheme,
});

const link = document.createElement('link');
link.setAttribute('rel', 'shortcut icon');
link.setAttribute('href', favicon);
document.head.appendChild(link);