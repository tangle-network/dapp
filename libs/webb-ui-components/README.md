<div align="center">
<a href="https://www.webb.tools/">

![Webb Logo](../../.github/assets/webb_banner_light.png#gh-light-mode-only)
![Webb Logo](../.././.github/assets/webb_banner_dark.png#gh-dark-mode-only)
</a>

</div>

# Webb UI Kit

<p align="left">
    <strong>🚀 A React implementation of Webb's Design System 🎨</strong>
    <br />
</p>

[![License Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0) [![Twitter](https://img.shields.io/badge/follow-%40webbprotocol-1DA1F2?logo=twitter&style=flat-square)](https://twitter.com/webbprotocol) [![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/webbprotocol) [![Discord](https://img.shields.io/discord/833784453251596298.svg?style=flat-square&label=Discord&logo=discord)](https://discord.gg/cv8EfJu3Tn)

<h2 id="start"> Getting Started  🎉 </h2>

This is the official component library for the Webb Ecosystem! It utilizes [nx.dev](https://nx.dev/) for a fast and extensible build system, and enables developers to build beautiful user interfaces for Web3 applications quickly. The library includes components that are documented using [Storybook](https://storybook.js.org/).

To view the available components, check out the official documentation [here](https://webb-tools.github.io/webb-dapp/). If you have feedback or questions, head to the [Webb Dapp Feedback Discussion](https://github.com/webb-tools/feedback/discussions/categories/webb-dapp-feedback). Contributions through PRs are welcomed!

## Prerequisites

This library makes use of yarn, nodejs, and requires version node v16. To install node.js binaries, installers, and source tarballs, please visit https://nodejs.org/en/download/. Once node.js is installed you may proceed to install [`yarn`](https://classic.yarnpkg.com/en/docs/install):

```bash
npm install --global yarn
```

This component library also makes use of [tailwindcss](https://tailwindcss.com/). For installation guides please refer to official documentation [here](https://tailwindcss.com/docs/installation/framework-guides). 

Great! Now your environment is ready! 🚀🚀

## Usage

This component library can be used by external dApp developers for their own projects, and by developers who want to contribute to the library or dApps within this monorepo. Instructions for both usages outlined below.

### External Usage

To make use of the library in your own project install `@webb-tools/webb-ui-components` with your package manager of choice: 

> NPM
```bash
npm install @webb-tools/webb-ui-components
```

> Yarn
```bash
yarn add @webb-tools/webb-ui-components
```

Now that we have installed the component library we need to include `WebbUIProvider` in our React project and import the css styles file like so:

```js
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/index.css';

const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
        <div>Hello dApp</div>
    </WebbUIProvider>
  );
};

export default App;
```

#### Customizing Component Styles

The component library make use of [tailwindcss](https://tailwindcss.com/) for styling components. If you would like to customize a component just use the tailwind classes provided. 

To make use of the tailwind classes for Webb's design system (e.g. colors, typos, …) in your dApp you just need to install Webb's tailwind preset and include it in the tailwind config file. See the below example:

```js
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
const preset = require('@webb-tools/tailwind-preset');

module.exports = {
  presets: [preset],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

You will now be able to make use of all of the components included in Webb's design system and Webb's preferred colors, typography and styles! 

### Internal Usage

Making changes to the component library or using it within Webb's monorepo you will need to build the component library by running the following:

```
nx build webb-ui-components
```

### To start [Storybook](https://storybook.js.org/) for component library viewing

1. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

2. Start the storybook:

   ```bash
   yarn nx storybook webb-ui-components
   ```

Visit `http://localhost:4400/` to see the Webb Component Library! 🕸️ 🚀

<h2 id="contribute"> Contributing </h2>

Interested in contributing to the Webb Dapp interface? Thank you so much for your interest! We are always appreciative for contributions from the open-source community!

If you have a contribution in mind, please check out our [Contribution Guide](./.github/CONTRIBUTING.md) for information on how to do so. We are excited for your first contribution!

### New Component Proposals

We welcome and encourage new component proposals from all developers! If you'd like to kick off a new component proposal, please submit an issue using the [ issue template](https://github.com/webb-tools/webb-dapp/issues/new/choose) and we will get in touch!

### Lint before you push! 🪥

Please ensure you lint and format your changes prior to opening a PR.

**To lint:**

```
yarn lint
```

**To Format:**

```
yarn format
```

**To Build:**

```
yarn build
```

<h2 id="license"> License </h2>

Licensed under <a href="LICENSE">Apache 2.0 license</a>.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this crate by you, as defined in the Apache 2.0 license, shall be licensed as above, without any additional terms or conditions.

