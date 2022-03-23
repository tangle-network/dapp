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

3. Start the dapp:

   ```base
   yarn start:dapp
   ```
## Use locally cached substrate fixtures
   - Download the proving key from [proving_key_uncompressed.bin](https://github.com/webb-tools/protocol-substrate-fixtures/blob/main/mixer/bn254/x5/proving_key_uncompressed.bin).
   - Save it to `packages/apps/public/cached-fixtures` , <i> the file name should be `proving_key_uncompressed.bin` </i>.
   - Run the dApp with `yarn start:localDapp`

## Mixer setup with [Local substrate node](https://github.com/webb-tools/protocol-substrate) and [Relayer](https://github.com/webb-tools/relayer)

#### Local nodes
1. Clone the node: `git clone https://github.com/webb-tools/protocol-substrate`
2. We are using [ORML](https://github.com/open-web3-stack/open-runtime-module-library/tree/a5ee7866c763efbd3afe0cd81fec54cede83a65f) fork, and fixed zero knowledge keys to run the mixers. Run `git submodule update --init` to populate them.
3. Build the `darkwebb-standalone-node` by `cargo build --release -p darkwebb-standalone-node`.
4. Startup two standalone nodes in other terminal instances:
   - `./target/release/darkwebb-standalone-node --dev --alice --node-key 0000000000000000000000000000000000000000000000000000000000000001 --ws-port=9944 --rpc-cors all`
	- `./target/release/darkwebb-standalone-node --dev --bob --port 33334 --tmp --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp`

#### Relayer
1. Clone the relayer: `git clone https://github.com/webb-tools/relayer.git`
2. Build the relayer: `cargo build --release`
3. Run with the local substrate configuration: `./target/release/webb-relayer -c config/local-substrate -vvv`

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
