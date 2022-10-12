// .storybook/YourTheme.js

import { create } from '@storybook/theming';
import {webbAsset} from './Logo.svg'

export default create({
  base: 'light',
  brandTitle: 'Webb UI Kit',
  brandUrl: 'https://www.webb.tools/',
  brandImage: 'https://github.com/webb-tools/webb-dapp/blob/db/stories/packages/webb-ui-components/src/stories/assets/Logo.svg#L1',
  brandTarget: '_self',
});
