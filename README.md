<h1 align="center">Webb Dapp 🕸️ </h1>
<div align="center">
<a href="https://www.webb.tools/">
    <img alt="Webb Logo" src="./.github/assets/webb-icon.svg" width="15%" height="30%" />
  </a>
  </div>
<p align="center">
    <strong>🚀  A decentralized interface into the Webb protocol 🚀</strong>
    <br />
</p>

<div align="center" >

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/webb-tools/webb-dapp/PR?style=flat-square)](https://github.com/webb-tools/webb-dapp/actions)
[![License Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![Twitter](https://img.shields.io/twitter/follow/webbprotocol.svg?style=flat-square&label=Twitter&color=1DA1F2)](https://twitter.com/webbprotocol)
[![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/webbprotocol)
[![Discord](https://img.shields.io/discord/833784453251596298.svg?style=flat-square&label=Discord&logo=discord)](https://discord.gg/cv8EfJu3Tn)

</div>

<!-- TABLE OF CONTENTS -->
<h2 id="table-of-contents"> 📖 Table of Contents</h2>

<details open="open">
  <summary>Table of Contents</summary>
  <ul>
    <li><a href="#start"> Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#test">Testing</a></li>
    <li><a href="#contribute">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ul>  
</details>

<h2 id="start"> Getting Started  🎉 </h2>

This is the official decentralized interface into the Webb protocol! 

For additional information, please refer to the [Webb Official Documentation](https://docs.webb.tools/v1/getting-started/overview/) 📝. Have feedback on how to improve the webb-dapp interface? Or have a specific question to ask? Checkout the [Webb Dapp Feedback Discussion](https://github.com/webb-tools/feedback/discussions/categories/webb-dapp-feedback) 💬.

<h3> Packages directory overview </h3>

- [apps](https://github.com/webb-tools/webb-dapp/tree/master/packages/apps): The endpoint of the dapp
- [bridge](https://github.com/webb-tools/webb-dapp/tree/master/packages/bridge): UI Components and hooks for the bridge
- [contracts](https://github.com/webb-tools/webb-dapp/tree/master/packages/contracts): Types and logic for interacting with smart contracts and generating zero knowledge proofs
- [mixer](https://github.com/webb-tools/webb-dapp/tree/master/packages/mixer): UI Components and hooks for the mixer
- [page-xxx](https://github.com/webb-tools/webb-dapp/tree/master/packages/): The top view of different pages in the dapp
- [react-components](https://github.com/webb-tools/webb-dapp/tree/master/packages/react-components): application-specific React UI components
- [react-environment](https://github.com/webb-tools/webb-dapp/tree/master/packages/react-environment): Typescript classes and APIs for application logic
- [react-hooks](https://github.com/webb-tools/webb-dapp/tree/master/packages/react-hooks): A variety of useful react hooks
- [ui-components](https://github.com/webb-tools/webb-dapp/tree/master/packages/ui-components): Reusable UI components
- [utils](https://github.com/webb-tools/webb-dapp/tree/master/packages/utils): Utilities like automatic note download, application storage, etc.
- [wallet](https://github.com/webb-tools/webb-dapp/tree/master/packages/wallet): For handling wallet logic of substrate/evm

## Prerequisites

This repository makes use of yarn, nodejs, and requires version node v16. To install node.js binaries, installers, and source tarballs, please visit https://nodejs.org/en/download/. Once node.js is installed you may proceed to install [`yarn`](https://classic.yarnpkg.com/en/docs/install):

```bash
npm install --global yarn
```

Great! Now your **Node** environment is ready! 🚀🚀

## Run locally 💻

Once the development environment is set up, you may proceed to install the required dependencies and run the dapp locally.

1. Clone this repo

   ```bash
   git clone git@github.com:webb-tools/webb-dapp.git && cd webb-dapp
   ```

2. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

3. Start the dapp:

   ```bash
   yarn start:dapp
   ```

Visit http://localhost:3000/ to see the Webb Dapp UI! 🕸️ 🚀

### Use locally cached substrate fixtures
   - Download the proving key from [proving_key_uncompressed.bin](https://github.com/webb-tools/protocol-substrate-fixtures/blob/main/mixer/bn254/x5/proving_key_uncompressed.bin).
   - Save it to `packages/apps/public/cached-fixtures` , <i> the file name should be `proving_key_uncompressed.bin` </i>.
   - Run the dApp with `yarn start:localDapp`

<h1 id="usage"> Usage </h1>

<h2 style="border-bottom:none"> Quick Start ⚡ </h2>

Eager to try out the Webb Dapp and see it in full action? You can setup a local Mixer with a local Relayer or try running a local EVM bridge with the Dapp!

### Mixer setup with [local substrate node](https://github.com/webb-tools/protocol-substrate) and [Relayer](https://github.com/webb-tools/relayer)

Follow the below steps to get up and running. 🏃
#### Setup local nodes
1. Clone the protocol-substrate repo:
```bash
 git clone https://github.com/webb-tools/protocol-substrate
```

2. We are using [ORML](https://github.com/open-web3-stack/open-runtime-module-library/tree/a5ee7866c763efbd3afe0cd81fec54cede83a65f) fork, and fixed zero knowledge keys to run the mixers. **Run:**
```bash
# populates fixed zero knowledge keys
git submodule update --init
```

3. Build the `webb-standalone-node` by running:
   
```bash   
cargo build --release -p darkwebb-standalone-node
```

4. Startup two standalone nodes in other terminal instances:
  
  ```bash
  # Run in terminal 1
  ./target/release/darkwebb-standalone-node --dev --alice --node-key 0000000000000000000000000000000000000000000000000000000000000001 --ws-port=9944 --rpc-cors all
  
  # Run in terminal 2
  ./target/release/darkwebb-standalone-node --dev --bob --port 33334 --tmp --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp
  ```

Great! Now you have 2 local protocol-substrate nodes running! Now let's setup a local relayer. 🚀

#### Relayer
1. Clone the relayer:
```bash
git clone https://github.com/webb-tools/relayer.git
```
2. Build the relayer: 
```bash
cargo build --release
```
3. Run with the local substrate configuration:
```
./target/release/webb-relayer -c config/local-substrate -vv
```

Congrats! 🎉  You now have a local mixer setup that you can use with this webb dapp locally!

### EVM Bridge setup with [local evm node](https://github.com/webb-tools/evm-localnet) and [Relayer](https://github.com/webb-tools/relayer)

Follow the below steps to get up and running. 🏃

#### Setup local EVM node

1. Clone the local testnet: 
```bash
git clone https://github.com/webb-tools/evm-localnet
```

2. Populate fixed zero knowledge keys by running:
```bash
git submodule update --init
```
3. Install dependencies:
```bash
  yarn install
``` 
4. Start the local testnet with:
```
yarn start
```
Great! Now you have a local EVM node running! Now let's setup a local relayer. 🚀

#### Relayer
1. Clone the relayer:
```bash
git clone https://github.com/webb-tools/relayer.git
```
2. Build the relayer: 
```bash
cargo build --release
```
3. Run with the local substrate configuration:
```
./target/release/webb-relayer -c config/local-testnet -vv
```

Congrats! 🎉  You now have a local bridge setup that you can use with this webb dapp locally!

<h2 id="test"> Testing 🧪 </h2>

The following instructions outlines how to run Webb Dapp test suite.

### To run tests

```
yarn test
```

<h2 id="contribute"> Contributing </h2>

Interested in contributing to the Webb Dapp interface? Thank you so much for your interest! We are always appreciative for contributions from the open-source community!

If you have a contribution in mind, please check out our [Contribution Guide](./.github/CONTRIBUTING.md) for information on how to do so. We are excited for your first contribution!

### Lint before you push! 🪥

Please ensure you lint and format your changes prior to opening a PR. 

**To lint:**

```
yarn lint
```

**To format:**

```
yarn format
```

<h2 id="license"> License </h2>

Licensed under <a href="LICENSE">Apache 2.0 license</a>.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this crate by you, as defined in the Apache 2.0 license, shall be licensed as above, without any additional terms or conditions.