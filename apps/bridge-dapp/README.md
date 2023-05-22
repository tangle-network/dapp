<div align="center">
<a href="https://www.webb.tools/">

![Webb Logo](../../.github/assets/webb_banner_light.png#gh-light-mode-only)
![Webb Logo](../../.github/assets/webb_banner_dark.png#gh-dark-mode-only)
</a>

  </div>

# Webb Hubble Bridge

<p align="left">
    <strong>🔭 Private cross-chain bridge for digital assets 🚀</strong>
    <br />
</p>

## Run Hubble Bridge 💻

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

Visit `http://localhost:3000/` to see the Webb Bridge Dapp UI! 🕸️ 🚀

### Run local Webb relayer and local network alongside Hubble bridge

To make local development and testing easier we can run a local EVM network and a local Webb relayer. In doing so, we will have access to a large supply of test tokens, access to both relayer and network logs to observe any unexpected issues during development. To accomplish this follow the below instructions.

#### Setting up local testnet

Before setting up a local testnet, we first need to clear our local storage in the browser for dApp to work correctly with our local evm testnet.

**1. Clear local storage in the browser**

Next, we will open a separate terminal window and execute the following instructions. For more in-depth protocol-solidity setup please refer to the [`README.md`](https://github.com/webb-tools/protocol-solidity#-getting-started---)

**2. Clone the [protocol-solidity](https://github.com/webb-tools/protocol-solidity) repo**

```
git clone https://github.com/webb-tools/protocol-solidity/
cd protocol-solidity
```

**3. Install dependencies**

```
yarn install
```

**4. Fetch submodules**

```
git submodule update --init --recursive
```

**5. Populate fixtures from the submodules:**

⚠️ **NOTE:** Prerequisites for fetching fixtures is to have [dvc](https://dvc.org/) installed locally. You can view installation instructions [here](https://dvc.org/doc/install). For macos it is recommended to install using `pip install dvc`.

```
yarn fetch:fixtures
```

**6. Compile contracts and build typescript interfaces**

```
yarn build
```

**7. Start local test network**

```
npx ts-node ./scripts/evm/deployments/LocalEvmVBridge.ts
```

Great! Now you have a running local EVM test network.

#### Setting up local relayer

To make use of a local relayer we will open a separate terminal window and execute the following instructions. For more in-depth relayer setup please refer to the relayer [`README.md`](https://github.com/webb-tools/relayer#-getting-started---)

**1. Clone the [relayer](https://github.com/webb-tools/relayer) repo**

```
git clone https://github.com/webb-tools/relayer
cd relayer
```

**2. Compile the relayer**

```
cargo build --release --features cli
```

**3. Setup `.env` file**

You will need to add `.env` file to run the Webb relayer.

```
touch .env
```

Then update with the following values:

```
# EVM LOCAL NET
GOVERNOR_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

WEBB_EVM_ATHENA_ENABLED=true
WEBB_EVM_DEMETER_ENABLED=true
WEBB_EVM_HERMES_ENABLED=true

ATHENA_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001
HERMES_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001
DEMETER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

ATHENA_HTTP_URL=http://127.0.0.1:5005
DEMETER_HTTP_URL=http://127.0.0.1:5006
HERMES_HTTP_URL=http://127.0.0.1:5004
ATHENA_WS_URL=wss://127.0.0.1:5005
DEMETER_WS_URL=wss://127.0.0.1:5006
HERMES_WS_URL=wss://127.0.0.1:5004
```

**4. Run a local relayer**

```
./target/release/webb-relayer -c config/development/evm-localnet/ -vv
```

Great! Now you have a running local relayer.

We now have our local environment running, next we will want to setup our MetaMask wallet to add test tokens and **reset the account** on Metamask to reset the account’s nonce and tx history. Please refer to the support article [here](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-an-account) for instructions on how to reset a MetaMask account.

Lastly, we will want to one of the following accounts to obtain test tokens.

```
// Any of these keys has 1000 ETH on each testnet
0x0000000000000000000000000000000000000000000000000000000000000001
0x0000000000000000000000000000000000000000000000000000000000000002
0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e
```

If you are unfamiliar with how to import an account with MetaMask, please refer to the support article [here](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account#:~:text=Click%20the%20circle%20icon%20at,key%20and%20click%20%E2%80%9CImport%E2%80%9D).

You have now successfully setup:

- local evm test network
- local Webb relayer
- local Hubble bridge
- configured your MetaMask wallet for testing / development

Happy hacking! 🚀💻
