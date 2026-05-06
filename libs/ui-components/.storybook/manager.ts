// .storybook/manager.js

import { addons } from '@storybook/manager-api';
import theme from './theme.js';
import favicon from '../src/stories/assets/favicon.png';

addons.setConfig({ theme });

const link = document.createElement('link');
link.setAttribute('rel', 'shortcut icon');
link.setAttribute('href', favicon);
document.head.appendChild(link);
