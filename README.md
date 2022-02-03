![license](https://img.shields.io/github/license/webb-tools/webb-dapp)

# Webb Dapp

A decentralized interface into the Webb protocol

# Overview

- [apps](https://github.com/webb-tools/webb-dapp/tree/master/packages/apps): The endpoint of the dapp
- [bridge](https://github.com/webb-tools/webb-dapp/tree/master/packages/bridge): UI Components and hooks for the bridge
- [contracts](https://github.com/webb-tools/webb-dapp/tree/master/packages/contracts): Types and logic for interacting with smart contracts and generating zero knowledge proofs
- [mixer](https://github.com/webb-tools/webb-dapp/tree/master/packages/mixer): UI Components and hooks for the mixer (tornados)
- [page-xxx](https://github.com/webb-tools/webb-dapp/tree/master/packages/): The top view of different pages in the dapp
- [react-components](https://github.com/webb-tools/webb-dapp/tree/master/packages/react-components): application-specific React UI components
- [react-environment](https://github.com/webb-tools/webb-dapp/tree/master/packages/react-environment): Typescript classes and APIs for application logic
- [react-hooks](https://github.com/webb-tools/webb-dapp/tree/master/packages/react-hooks): A variety of useful react hooks
- [ui-components](https://github.com/webb-tools/webb-dapp/tree/master/packages/ui-components): Reusable UI components
- [utils](https://github.com/webb-tools/webb-dapp/tree/master/packages/utils): Utilities like automatic note download, application storage, etc.
- [wallet](https://github.com/webb-tools/webb-dapp/tree/master/packages/wallet): For handling wallet logic of substrate/evm

# Run locally

1. Clone this repo

   ```base
   git clone git@github.com:webb-tools/webb-dapp.git && cd webb-dapp
   ```

2. Install dependencies by `yarn`

   ```base
   yarn install
   ```

3. Build the application:

   ```base
   yarn build:dapp:development
   ```

4. Serve the website from `packages/apps/build/`
   - You can use something like: [dead-server](https://www.npmjs.com/package/dead-server)

# Development

While working in development, make the following changes:

1. Running the DApp without worrying about fixtures just `yarn start:dApp`.
   - Solidity fixtures already bundled.
   - Substrate fixtures are fetched from IPFS.
2. For substrate side of the mixer to not fetch the fixtures every time (we are working on caching them),
   - Download the proving key from [proving_key_uncompressed.bin](https://github.com/webb-tools/protocol-substrate-fixtures/blob/main/mixer/bn254/x5/proving_key_uncompressed.bin).
   - Save it to `packages/apps/public/cached-fixtures` , <i> the file name should be `proving_key_uncompressed.bin` </i>.
   - Run the dApp with `yarn start:localDapp`

 ## mixer setup [Local substrate node](https://github.com/webb-tools/darkwebb-substrate)
1. Clone the node: `git clone https://github.com/webb-tools/protocol-substrate`
2. We are using [ORML](https://github.com/open-web3-stack/open-runtime-module-library/tree/a5ee7866c763efbd3afe0cd81fec54cede83a65f) fork, and fixtures to run the mixers `git submodule update --init` to populate them
3. Build the `standalone-node` by `cargo build --release -p darkwebb-standalone-node`.
4. we initially have mixers populated for testing make sure you have native asset on you wallet.

## Fixtures

Fixtures can be found at [protocol-solidity](https://github.com/webb-tools/protocol-solidity-fixtures) and [protocol-substrate](https://github.com/webb-tools/protocol-substrate-fixtures),
for the `develop` branch setup no worries about protocol solidity fixtures


## Running local webb-tools

To test a webb-tools local build in the dapp, update the yarn resolutions with the following:

```json
{
  "resolutions": {
    "@webb-tools/type-definitions": "file:../webb.js/packages/type-definitions/build",
    "@webb-tools/api": "file:../webb.js/packages/api/build",
    "@webb-tools/types": "file:../webb.js/packages/types/build",
    "@webb-tools/app-util": "file:../webb.js/packages/app-util/build",
    "@webb-tools/sdk-core": "file:../webb.js/packages/sdk-core/build",
    "@webb-tools/wasm-utils": "file:../webb.js/packages/wasm-utils/build"
  }
}
```

```bash
# run this to update the packages
yarn install --check-files
```
