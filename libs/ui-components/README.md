<div align="center">
<a href="https://www.tangle.tools/">

![Tangle Logo](./src/assets/tangle-banner.png)
</a>

</div>

# UI Components Library

<p align="left">
    <strong> A React implementation of Tangle's Design System </strong>
    <br />
</p>

[![License Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0.html)
[![X](https://img.shields.io/badge/follow-%40tangle_network-1DA1F2?logo=x&style=flat-square)](https://x.com/tangle_network)
[![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/tanglenet)
[![Discord](https://img.shields.io/discord/833784453251596298.svg?style=flat-square&label=Discord&logo=discord)](https://discord.gg/cv8EfJu3Tn)

<h2 id="start"> Getting Started </h2>

This is the official component library for the Tangle Network! It utilizes [nx.dev](https://nx.dev/) for a fast and extensible build system, and enables developers to build beautiful user interfaces for Web3 applications quickly.

If you have feedback or questions, head to the [Tangle Network Feedback Discussion](https://github.com/tangle-network/feedback/discussions/categories/dapp-feedback). Contributions through PRs are welcomed!

## Prerequisites

This library makes use of yarn, nodejs, and requires version node `>=18.18.x`. To install node.js binaries, installers, and source tarballs, please visit https://nodejs.org/en/download/.

Once node.js is installed you may proceed to install [`yarn`](https://yarnpkg.com/getting-started) via `corepack`:

```bash
corepack enable
```

Great! Now your environment is ready!

## Usage

This component library can be used by external dApp developers for their own projects, and by developers who want to contribute to the library or dApps within this monorepo. Instructions for both usages outlined below.

### External Usage

To make use of the library in your own project install `@tangle-network/ui-components` with your package manager of choice:

> NPM

```bash
npm install @tangle-network/ui-components
```

> Yarn

```bash
yarn add @tangle-network/ui-components
```

Now that we have installed the component library we need to include `UIProvider` in our React project and import the css styles file like so:

```js
import { UIProvider } from '@tangle-network/ui-components';
import '@tangle-network/ui-components/index.css';

const App: FC = () => {
  return (
    <UIProvider hasErrorBoudary>
      <div>Hello dApp</div>
    </UIProvider>
  );
};

export default App;
```

#### Customizing Component Styles

The component library make use of [tailwindcss](https://tailwindcss.com/) for styling components. If you would like to customize a component just use the tailwind classes provided.

To leverage Tangle's design system (including colors, typography, and other styling elements) in your dApp, you can incorporate Tangle's tailwind preset into your tailwind configuration file. Here's how to set it up:

```js
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
const preset = require('@tangle-network/ui-components/tailwind.preset');

module.exports = {
  presets: [preset],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

You will now be able to make use of all of the components included in Tangle's design system and Tangle's preferred colors, typography and styles!

### Internal Usage

Making changes to the component library or using it within Tangle's monorepo you will need to build the component library by running the following:

```
nx build ui-components
```

### To start [Storybook](https://storybook.js.org/) for component library viewing

1. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

2. Start the storybook:

   ```bash
   yarn nx storybook ui-components
   ```

Visit `http://localhost:4400/` to see the Tangle Component Library!

<h2 id="contribute"> Contributing </h2>

Interested in contributing to the Tangle Network interface? Thank you so much for your interest! We are always appreciative for contributions from the open-source community!

If you have a contribution in mind, please check out our [Contribution Guide](../../.github/CONTRIBUTING.md) for information on how to do so. We are excited for your first contribution!

### New Component Proposals

We welcome and encourage new component proposals from all developers! If you'd like to kick off a new component proposal, please submit an issue using the [issue template](https://github.com/tangle-network/dapp/issues/new/choose) and we will get in touch!

### Lint before you push!

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

Licensed under <a href="https://github.com/tangle-network/dapp/blob/develop/LICENSE">Apache 2.0 license</a>.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this crate by you, as defined in the Apache 2.0 license, shall be licensed as above, without any additional terms or conditions.
