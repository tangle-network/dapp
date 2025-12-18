# TNT Migration Claim - Local Testing Guide

This guide walks you through setting up and testing the TNT migration claim process locally from scratch.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Start Local Blockchain](#3-start-local-blockchain)
4. [Deploy Contracts](#4-deploy-contracts)
5. [Setup Browser Wallets](#5-setup-browser-wallets)
6. [Start Backend Services](#6-start-backend-services)
7. [Start Frontend](#7-start-frontend)
8. [Test the Claim Flow](#8-test-the-claim-flow)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | v18.18+ | [nodejs.org](https://nodejs.org/) |
| Yarn | v4.x | Included with repo |
| Foundry | Latest | See below |
| Git | Any | [git-scm.com](https://git-scm.com/) |

### Browser Extensions

| Extension | Purpose | Install |
|-----------|---------|---------|
| MetaMask | EVM wallet for receiving TNT | [metamask.io](https://metamask.io/) |
| Polkadot.js | Substrate wallet for signing | [polkadot.js.org/extension](https://polkadot.js.org/extension/) |

### Install Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Reload shell and install tools
source ~/.bashrc  # or ~/.zshrc
foundryup

# Verify installation
forge --version
anvil --version
cast --version
```

---

## 2. Initial Setup

### Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd dapp

# Install all dependencies
yarn install
```

### Install Contract Script Dependencies

```bash
cd contracts/migration-claim/scripts
yarn install
cd ../../..
```

---

## 3. Start Local Blockchain

Open **Terminal 1** and start Anvil (local Ethereum node):

```bash
anvil
```

You should see output like:
```
                             _   _
                            (_) | |
      __ _   _ __   __   __  _  | |
     / _` | | '_ \  \ \ / / | | | |
    | (_| | | | | |  \ V /  | | | |
     \__,_| |_| |_|   \_/   |_| |_|

Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...

Listening on 127.0.0.1:8545
```

**Keep this terminal running!**

---

## 4. Deploy Contracts

Open **Terminal 2** and run the deployment script:

```bash
cd contracts/migration-claim
./scripts/deploy-local-complete.sh
```

This script will:
1. ✅ Generate test merkle tree with 5 test accounts
2. ✅ Build and deploy all contracts (TNT, MockZKVerifier, TangleMigration)
3. ✅ Fund the migration contract with test tokens
4. ✅ Copy proofs to frontend (`apps/tangle-dapp/public/data/migration-proofs.json`)
5. ✅ Create environment files (`apps/tangle-dapp/.env.local` and `apps/claim-relayer/.env`)

### Expected Output

```
============================================
  Deployment Complete!
============================================

Contract Addresses:
  TNT Token:        0x5FbDB2315678afecb367f032d93F642f64180aa3
  MockZKVerifier:   0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  TangleMigration:  0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

> **Note**: Your addresses may differ if you've restarted Anvil. The script automatically updates the `.env` files with the correct addresses.

---

## 5. Setup Browser Wallets

### 5.1 MetaMask - Add Local Network

1. Open MetaMask
2. Click the network dropdown (top left)
3. Click **"Add network"** → **"Add a network manually"**
4. Enter:
   | Field | Value |
   |-------|-------|
   | Network name | `Localhost` |
   | RPC URL | `http://localhost:8545` |
   | Chain ID | `31337` |
   | Currency symbol | `ETH` |
5. Click **"Save"**
6. Switch to the **Localhost** network

### 5.2 MetaMask - Import TNT Token

1. In MetaMask, click **"Import tokens"** (bottom of asset list)
2. Select **"Custom token"** tab
3. Enter:
   | Field | Value |
   |-------|-------|
   | Token contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
   | Token symbol | `TNT` (auto-fills) |
   | Token decimals | `18` (auto-fills) |
4. Click **"Add custom token"** → **"Import tokens"**

> **Note**: If your deployment created different addresses, check `contracts/migration-claim/deployment-local.json` for the correct TNT address.

### 5.3 Polkadot.js Extension - Import Test Account

The test accounts use a specific derivation path. You must include `//Alice` in the seed phrase.

1. Open Polkadot.js Extension
2. Click **`+`** (plus icon)
3. Select **"Import account from pre-existing seed"**
4. In the mnemonic field, enter the **complete string** (including `//Alice`):
   ```
   bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice
   ```
5. Click **"Next"**
6. Set name: `Alice`
7. Set a password
8. Click **"Add the account with the supplied seed"**

**Verify**: The address should be `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`

### Available Test Accounts

| Account | Seed Phrase (with derivation) | Expected Address | Claimable |
|---------|-------------------------------|------------------|-----------|
| Alice | `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice` | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` | 1,000,000 TNT |
| Bob | `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Bob` | `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty` | 500,000 TNT |
| Charlie | `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Charlie` | `5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y` | 250,000 TNT |
| Dave | `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Dave` | `5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy` | 100,000 TNT |
| Eve | `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Eve` | `5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw` | 50,000 TNT |

---

## 6. Start Backend Services

### 6.1 Start Claim Relayer

Open **Terminal 3**:

```bash
cd apps/claim-relayer
yarn dev
```

Expected output:
```
Claim Relayer started on port 3001
Relayer address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Contract: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

**Keep this terminal running!**

### Verify Relayer is Running

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "relayer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "chainId": 31337,
  "paused": false
}
```

---

## 7. Start Frontend

Open **Terminal 4**:

```bash
# From repository root
yarn start:tangle-dapp
```

Wait for the build to complete. You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:4200/
```

**Open in browser**: http://localhost:4200/claim/migration

---

## 8. Test the Claim Flow

### Step-by-Step Claim Process

1. **Navigate to Claim Page**
   - Go to http://localhost:4200/claim/migration

2. **Connect EVM Wallet (Step 1)**
   - Click **"Connect EVM Wallet"**
   - Select MetaMask
   - Approve the connection
   - Your receiving address will be displayed

3. **Connect Polkadot Wallet (Step 2)**
   - Click **"Connect Polkadot"** or the wallet selector
   - Select **Polkadot.js**
   - Approve the connection
   - Select **Alice** (or your imported account)

4. **Check Eligibility**
   - The page will automatically check eligibility
   - You should see: **"You are eligible to claim 1,000,000 TNT"**

5. **Sign Ownership Proof (Step 3)**
   - Click **"Sign Ownership Proof"**
   - Polkadot.js extension will prompt for signature
   - Enter your password and sign

6. **Generate ZK Proof (Step 4)**
   - Click **"Generate ZK Proof"**
   - In local dev mode with `VITE_MOCK_PROOF=true`, this uses a mock proof
   - Wait for completion (should be instant in mock mode)

7. **Submit Claim (Step 5)**
   - Click **"Claim 1,000,000 TNT"**
   - The relayer will submit the transaction
   - Wait for confirmation

8. **Verify Success**
   - You should see **"Claim Successful!"** with the transaction hash
   - Check MetaMask - your TNT balance should now show 1,000,000 TNT

### Verification Commands

Check migration contract balance (should decrease after claim):
```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "balanceOf(address)" 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 \
  --rpc-url http://localhost:8545
```

Check if address has claimed:
```bash
# Get Alice's pubkey and check claimed amount
curl http://localhost:3001/status/0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
```

---

## 9. Troubleshooting

### Issue: "Contract not configured" / Dev Mode Banner

**Cause**: The `VITE_TANGLE_MIGRATION_ADDRESS` is not set or incorrect.

**Solution**:
```bash
# Check if .env.local exists and has correct address
cat apps/tangle-dapp/.env.local

# Re-run deployment if needed
cd contracts/migration-claim
./scripts/deploy-local-complete.sh
```

### Issue: "Failed to fetch" when submitting claim

**Cause**: Relayer is not running or unreachable.

**Solution**:
```bash
# Check if relayer is running
curl http://localhost:3001/health

# If not, start it
cd apps/claim-relayer
yarn dev
```

### Issue: "InvalidMerkleProof" error

**Cause**: Merkle root in contract doesn't match the proofs file.

**Solution**:
```bash
# Re-deploy contracts (this regenerates merkle tree)
cd contracts/migration-claim
./scripts/deploy-local-complete.sh
```

### Issue: Wrong address when importing test account

**Cause**: Derivation path not included in seed phrase.

**Solution**: Make sure to include `//Alice` (or `//Bob`, etc.) directly in the seed phrase:
```
bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice
```

### Issue: MetaMask shows wrong network

**Solution**:
1. Open MetaMask
2. Switch to **Localhost** network
3. If not available, add it manually (see Section 5.1)

### Issue: Anvil restarted, addresses changed

**Cause**: Anvil generates deterministic addresses, but nonce-based. Restarting resets state.

**Solution**:
```bash
# Re-deploy contracts after Anvil restart
cd contracts/migration-claim
./scripts/deploy-local-complete.sh

# Then re-add TNT token to MetaMask with new address
```

### Issue: "Already claimed" error

**Cause**: The test account has already claimed.

**Solution**:
- Use a different test account (Bob, Charlie, etc.)
- Or restart Anvil and re-deploy to reset state

---

## Quick Reference

### Terminal Layout

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `anvil` | Local blockchain |
| 2 | `./scripts/deploy-local-complete.sh` | Deploy contracts (run once) |
| 3 | `cd apps/claim-relayer && yarn dev` | Claim relayer API |
| 4 | `yarn start:tangle-dapp` | Frontend dApp |

### Key URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200/claim/migration |
| Relayer Health | http://localhost:3001/health |
| Anvil RPC | http://localhost:8545 |

### Contract Addresses (Default)

| Contract | Address |
|----------|---------|
| TNT Token | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| TangleMigration | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| MockZKVerifier | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |

> Addresses may vary. Check `contracts/migration-claim/deployment-local.json` for actual values.

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser       │     │  Claim Relayer  │     │     Anvil       │
│                 │     │   (Port 3001)   │     │   (Port 8545)   │
│  ┌───────────┐  │     │                 │     │                 │
│  │ MetaMask  │  │     │  Pays gas for   │     │  ┌───────────┐  │
│  │ (EVM)     │──┼─────┼─► users         │─────┼─►│ TNT Token │  │
│  └───────────┘  │     │                 │     │  └───────────┘  │
│                 │     │                 │     │                 │
│  ┌───────────┐  │     │                 │     │  ┌───────────┐  │
│  │Polkadot.js│  │     │                 │     │  │ Migration │  │
│  │(Substrate)│──┼─────┼─► Signs proof   │─────┼─►│ Contract  │  │
│  └───────────┘  │     │                 │     │  └───────────┘  │
│                 │     │                 │     │                 │
│  ┌───────────┐  │     │                 │     │  ┌───────────┐  │
│  │ Frontend  │──┼─────┼─► POST /claim   │     │  │   Mock    │  │
│  │ (React)   │  │     │                 │     │  │ Verifier  │  │
│  └───────────┘  │     │                 │     │  └───────────┘  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Flow Summary

1. User connects both wallets (MetaMask + Polkadot.js)
2. Frontend checks eligibility from `migration-proofs.json`
3. User signs challenge with Substrate key (proves ownership)
4. Frontend generates ZK proof (mocked in local dev)
5. Frontend POSTs claim to relayer
6. Relayer submits transaction to TangleMigration contract
7. Contract verifies merkle proof + ZK proof
8. TNT tokens transferred to user's EVM address
