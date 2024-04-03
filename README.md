<div align="center">
<a href="https://www.webb.tools/">

![Webb Logo](./.github/assets/webb_banner_light.png#gh-light-mode-only)
![Webb Logo](./.github/assets/webb_banner_dark.png#gh-dark-mode-only)
</a>

  </div>

# Webb Monorepo

<p align="left">
    <strong>Decentralized interfaces into the Webb protocol, featuring Tangle Network dApps for MPC-as-a-service restaking infrastructure.</strong>
    <br />
</p>

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/webb-tools/webb-dapp/check-build.yml?branch=develop&style=flat-square)](https://github.com/webb-tools/webb-dapp/actions) [![License Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0.html) [![Follow Tangle on twitter](https://img.shields.io/twitter/follow/tangle_network.svg?style=social)](https://twitter.com/intent/follow?screen_name=tangle_network) [![Follow Webb on twitter](https://img.shields.io/twitter/follow/webbprotocol.svg?style=social)](https://twitter.com/intent/follow?screen_name=webbprotocol) [![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/webbprotocol) [![Discord](https://img.shields.io/discord/833784453251596298.svg?style=flat-square&label=Discord&logo=discord)](https://discord.gg/cv8EfJu3Tn)

<!-- TABLE OF CONTENTS -->
<h2 id="table-of-contents" style=border:0!important> Table of Contents </h2>

<details open="open">
  <summary id="#table-of-contents">Table of Contents</summary>
  <ul>
    <li><a href="#start">Getting Started</a></li>
    <li><a href="#apps">Applications</a></li>
    <li><a href="#libs">Libraries</a></li>
    <li><a href="#test">Testing</a></li>
    <li><a href="#contribute">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#help">Need help?</a></li>
  </ul>
</details>

<h2 id="start"> Getting Started </h2>

This monorepo is the cornerstone for decentralized interfaces within the Webb protocol, incorporating a suite of dApps, including the revolutionary [Tangle Network](https://tangle.tools) applications. These applications are geared towards kickstarting advanced cryptographic developments and innovations in blockchain technology, leveraging multi-party computation (MPC) services and cross-chain capabilities. 

It uses [nx.dev](https://nx.dev/) for fast and extensible building. The `apps` directory contains the protocol's interfaces while `libs` contains the necessary code and logic.

### Prerequisites

This repository makes use of yarn, nodejs, and requires version node v18. To install node.js binaries, installers, and source tarballs, please visit https://nodejs.org/en/download/. Once node.js is installed you may proceed to install [yarn](https://classic.yarnpkg.com/en/docs/install):

```bash
npm install --global yarn
```

Great! Now your **Node** environment is ready!

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>

<h2 id="apps"> Applications </h2>

- [tangle-dapp](./apps/tangle-dapp/README.md): the central hub to managing Tangle Network assets and MPC (Multi-Party Computation) services.
- [bridge-dapp](./apps/bridge-dapp/README.md): an interface for interacting and bridging assets cross-chain using Webb's Asset Protocol.
- [faucet](./apps/faucet/README.md): an interface for requesting cryptocurrencies (assets) on the Webb Protocol System.
- [hubble-stats](./apps/hubble-stats/README.md): an interface for displaying statistical data of the Cross-chain Bridging System.
- [stats-dapp](./apps/stats-dapp/README.md): an interface for displaying statistical data of Webb's Tangle Network (DKG system).
- [zk-explorer](./apps/zk-explorer/README.md): a platform for discovering and learning about zero-knowledge proof projects and circuits, featuring detailed project insights, filtering options, and more.

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>

<h2 id="libs"> Libraries </h2>

- `abstract-api-provider`: a collection of base and abstract classes that unify the API across multiple providers.
- `api-provider-environment`: contains the React context definitions, the app event, and functions for handling interactive feedback errors for the bridge app.
- `browser-utils`: contains all the browser utility functions, such as fetch with caching, download file and string, the customized logger class, get browser platform, and the storage factory function for interacting with local storage.
- `dapp-config`: contains all configurations (chains, wallets, etc.) for the bridge dApp.
- `dapp-types`: contains all the sharable TypeScript types and interfaces across the apps.
- `icons`: contains all the sharable icons across the apps.
- `note-manager`: contains all the logic for storing note account data.
- `polkadot-api-provider`: the Substrate (or Polkadot) provider for the bridge.
- `react-hooks`: contains all the sharable hooks across the apps.
- `relayer-manager-factory`: contains all the logic for interacting with the relayer.
- `tailwind-preset`: the Webb TailwindCSS preset for all the apps.
- `web3-api-provider`: the EVM provider for the bridge.
- [webb-ui-components](./libs/webb-ui-components/README.md): a collection of reusable components for building interfaces quickly.

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>

<h2 id="test"> Testing </h2>

The following instructions outlines how to run Webb Dapp test suite.

### To run tests

```
yarn test
```

### To start [Storybook](https://storybook.js.org/) for component library

1. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

2. Start the storybook:

   ```bash
   yarn nx storybook webb-ui-components
   ```

Visit `http://localhost:4400/` to see the Webb Component Library!

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>

<h2 id="contribute"> Contributing </h2>

Interested in contributing to the Webb Dapp interface? Thank you so much for your interest! We are always appreciative for contributions from the open-source community!

If you would like to contribute, please refer to our [Contribution Guide](./.github/CONTRIBUTING.md) for instructions. We are excited for your first contribution!

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

Additionally, to ensure commit message consistency, this repository uses [commitlint](https://commitlint.js.org/#/) and [husky](https://typicode.github.io/husky/#/). Please refer to the [Commit Message Guidelines](./.github/CONTRIBUTING.md#commit-message-guidelines) for more information.

Without proper linting, formatting, or commit message, husky will prevent you from either committing or pushing your changes.

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>

<h2 id="license"> License </h2>

Licensed under <a href="LICENSE">Apache 2.0 license</a>.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this crate by you, as defined in the Apache 2.0 license, shall be licensed as above, without any additional terms or conditions.

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>

<h2 id="help"> Need help? </h2>

If you need help or you want to additional information please:

- Refer to the [Tangle Network Official Documentation](https://docs.tangle.tools/) or [Webb Official Documentation](https://docs.webb.tools/).
- If you have feedback on how to improve the dApp interface or you have a specific question? Check out the [Tangle dApp Feedback Discussion](https://github.com/webb-tools/feedback/discussions/categories/tangle-dapp) or [Webb dApp Feedback Discussion](https://github.com/webb-tools/feedback/discussions/categories/webb-dapp-feedback). 
- If you found a bug please [open an issue](https://github.com/webb-tools/webb-dapp/issues/new/choose) or [join our Discord](https://discord.gg/jUDeFpggrR) server to report it.

---

**Follow us at**
[![Follow Tangle on twitter](https://img.shields.io/twitter/follow/tangle_network.svg?style=social)](https://twitter.com/intent/follow?screen_name=tangle_network)
[![Follow Webb on twitter](https://img.shields.io/twitter/follow/webbprotocol.svg?style=social)](https://twitter.com/intent/follow?screen_name=webbprotocol)
[![Follow Webb on LinkedIn](https://img.shields.io/badge/LinkedIn-webbprotocol-blue?style=flat&logo=linkedin&logoColor=b0c0c0&labelColor=363D44)](https://www.linkedin.com/company/webb-protocol/)

---

**Share** the project link with your network on social media.

<a href="https://www.linkedin.com/shareArticle?mini=true&url=https%3A//github.com/webb-tools/webb-dapp" target="_blank">
  <img src="https://img.shields.io/twitter/url?label=LinkedIn&logo=LinkedIn&style=social&url=https%3A%2F%2Fgithub.com%2Fwebb-tools%2Fwebb-dapp" alt="Share on LinkedIn"/>
</a>
<a href="https://twitter.com/intent/tweet?text=%F0%9F%9A%80%20Explore%20%60webb-tools/webb-dapp%60%20Monorepo%20on%20Github%3A%20your%20%23zeroKnowledgeApp%20in%20%23blockchain.%20Secure%2c%20efficient%20%23crypto%20interactions%20await!%0A%0ADive%20in%20%E2%9E%A1%EF%B8%8F%20https%3A//github.com/webb-tools/webb-dapp%20%23webbEcosystem" target="_blank">
  <img src="https://img.shields.io/twitter/url?label=Twitter&logo=Twitter&style=social&url=https%3A%2F%2Fgithub.com%2Fwebb-tools%2Fwebb-dapp" alt="Shared on Twitter"/>
</a>
<a href="https://t.me/share/url?text=%F0%9F%9A%80%20Explore%20%60webb-tools/webb-dapp%60%20Monorepo%20on%20Github%3A%20your%20%23zeroKnowledgeApp%20in%20%23blockchain.%20Secure%2c%20efficient%20%23crypto%20interactions%20await!%0A%0ADive%20in%20%E2%9E%A1%EF%B8%8F%20https%3A//github.com/webb-tools/webb-dapp%20%23webbEcosystem&url=https%3A%2F%2Fgithub.com%2Fwebb-tools%2Fwebb-dapp" target="_blank">
  <img src="https://img.shields.io/twitter/url?label=Telegram&logo=Telegram&style=social&url=https%3A%2F%2Fgithub.com%2Fawebb-tools%webb-dapp" alt="Share on Telegram"/>
</a>

<div align="right"><a href="#table-of-contents">↑ Back to top ↑</a></div>
