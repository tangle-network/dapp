<div align="center">
<a href="https://www.webb.tools/">

![Webb Logo](./.github/assets/webb_banner_light.png#gh-light-mode-only)
![Webb Logo](./.github/assets/webb_banner_dark.png#gh-dark-mode-only)
</a>

  </div>

# Webb Monorepo

<p align="left">
    <strong>🚀  Decentralized interfaces into the Webb protocol 🚀</strong>
    <br />
</p>

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/webb-tools/webb-dapp/check-build.yml?branch=develop&style=flat-square)](https://github.com/webb-tools/webb-dapp/actions) [![License Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/license/apache2-0-php/) [![Twitter](https://img.shields.io/badge/follow-%40webbprotocol-1DA1F2?logo=twitter&style=flat-square)](https://twitter.com/webbprotocol) [![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/webbprotocol) [![Discord](https://img.shields.io/discord/833784453251596298.svg?style=flat-square&label=Discord&logo=discord)](https://discord.gg/cv8EfJu3Tn)

<!-- TABLE OF CONTENTS -->
<h2 id="table-of-contents" style=border:0!important> 📖 Table of Contents</h2>

<details open="open">
  <summary>Table of Contents</summary>
  <ul>
    <li><a href="#start"> Getting Started</a></li>
    <li><a href="#test">Testing</a></li>
    <li><a href="#contribute">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ul>  
</details>

<h2 id="start"> Getting Started  🎉 </h2>

This repo is a monorepo containing decentralized interfaces into the Webb protocol! It makes use of [nx.dev](https://nx.dev/) for fast and extensible build system. The repo consists of 3 notable areas:

- [bridge-dapp:](https://github.com/webb-tools/webb-dapp/tree/develop/apps/bridge-dapp) an interface for interacting and bridging assets cross-chain using Webb's Asset Protocol.
- [stats-dapp:](https://github.com/webb-tools/webb-dapp/tree/develop/apps/stats-dapp) an interface for displaying statistics data of Webb's Tangle Network.
- [webbsite:](https://github.com/webb-tools/webb-dapp/tree/develop/apps/webbsite) an interface for the Webb ecosystem and development.
- [webb-ui-components:](https://github.com/webb-tools/webb-dapp/tree/develop/libs/webb-ui-components) a collection of reusable components for building interfaces quickly.

For additional information, please refer to the [Webb Official Documentation](https://docs.webb.tools/) 📝. Have feedback on how to improve the webb-dapp interface? Or have a specific question to ask? Checkout the [Webb Dapp Feedback Discussion](https://github.com/webb-tools/feedback/discussions/categories/webb-dapp-feedback) 💬.

## Prerequisites

This repository makes use of yarn, nodejs, and requires version node v16. To install node.js binaries, installers, and source tarballs, please visit https://nodejs.org/en/download/. Once node.js is installed you may proceed to install [`yarn`](https://classic.yarnpkg.com/en/docs/install):

```bash
npm install --global yarn
```

Great! Now your **Node** environment is ready! 🚀🚀

## Run Hubble bridge locally 💻

Once the development environment is set up, you may proceed to install the required dependencies and run the dapp locally.

1. Clone this repo

   ```bash
   git clone git@github.com:webb-tools/webb-dapp.git && cd webb-dapp
   ```

2. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

3. Start the bridge-dapp:

   ```bash
   yarn start:bridge
   ```

Visit `http://localhost:3000/` to see the Webb Bridge Dapp UI! 🕸️ 🚀 If you would like to utilize the Hubble bridge
with a local EVM network and local relayer refer to the instructions [here](https://github.com/webb-tools/webb-dapp/tree/develop/apps/bridge-dapp#webb-hubble-bridge).

### Setting Up a Local EVM Network with Hubble Bridge

If you want to create a local EVM network with a local relayer and Hubble bridge, we have step-by-step instructions you can follow [here](https://github.com/webb-tools/webb-dapp/tree/develop/apps/bridge-dapp#webb-hubble-bridge). Before setting up a local EVM network be sure to clear your `localStorage`. 

If you're comfortable running scripts and using a macOS environment, you can use the following scripts in the `/tools/scripts/` directory to quickly set up a local testing environment:

- `contracts.sh`: This script compiles Webb smart contracts from [protocol-solidity](https://github.com/webb-tools/protocol-solidity), sets up an EVM localnet (e.g. Hermes, Athena, and Demeter), and populates required fixtures. You can use this script on its own.
- `relayer.sh`: This script sets up the required `.env` variables for running a [Webb relayer](https://github.com/webb-tools/relayer) for the EVM localnets, fetches the `webb-relayer` binary, and executes it. You must have an EVM localnet running to use this script.
- `bridge.sh`: This script sets up and starts the Hubble bridge at `localhost:3000`. You can use this script on its own.
- `local-bridge-network.sh`: This script runs all the above scripts for an entire local network setup. It compiles the Webb smart contracts, sets up the EVM localnet, adds the required `.env` variables, fetches the `webb-relayer` binary, executes it, and starts the local Hubble bridge at `localhost:3000`. It opens three Terminal windows and can only be run in a macOS environment.

We now have our local environment running, next we will want to setup our MetaMask wallet to add test tokens and **reset the account** on Metamask to reset the account’s nonce and tx history. Please refer to the support article [here](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-an-account) for instructions on how to reset a MetaMask account.  

Lastly, we will want to one of the following accounts to obtain test tokens.

```
// Any of these keys has 1000 ETH on each testnet
0x0000000000000000000000000000000000000000000000000000000000000001
0x0000000000000000000000000000000000000000000000000000000000000002
0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e
```

If you are unfamiliar with how to import an account with MetaMask, please refer to the support article [here](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account#:~:text=Click%20the%20circle%20icon%20at,key%20and%20click%20%E2%80%9CImport%E2%80%9D).  

## Run stats-dapp locally 💻

Once the development environment is set up, you may proceed to install the required dependencies and run the dapp locally.

1. Clone this repo

   ```bash
   git clone git@github.com:webb-tools/webb-dapp.git && cd webb-dapp
   ```

2. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

3. Start the stats-dapp:

   ```bash
   yarn start:stats
   ```

Visit `http://localhost:3000/` to see the Webb Stats UI! 🕸️ 🚀 If you would like to setup a local SubQuery backend please refer to the instructions [here](https://github.com/webb-tools/webb-subql#webb-subquery).

<h2 id="test"> Testing 🧪 </h2>

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

Visit `http://localhost:4400/` to see the Webb Component Library! 🕸️ 🚀

<h2 id="contribute"> Contributing </h2>

Interested in contributing to the Webb Dapp interface? Thank you so much for your interest! We are always appreciative for contributions from the open-source community!

If you have a contribution in mind, please check out our [Contribution Guide](./.github/CONTRIBUTING.md) for information on how to do so. We are excited for your first contribution!

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
