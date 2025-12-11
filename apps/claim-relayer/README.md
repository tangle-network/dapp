# TNT Migration Claim Relayer

A simple relayer service that enables gasless claims for the TNT Migration. Users can claim their tokens without needing ETH for gas - the relayer pays gas on their behalf.

## How It Works

1. User generates a ZK proof proving they own the Substrate key
2. User sends claim data to the relayer (no wallet signature needed)
3. Relayer submits the transaction and pays gas
4. Tokens are sent directly to the user's specified recipient address

This works because:
- The TangleMigration contract doesn't use `msg.sender` for authorization
- The ZK proof cryptographically binds the claim to a specific recipient
- Anyone can submit a valid claim on behalf of the user

## Setup

### 1. Install dependencies

```bash
cd apps/claim-relayer
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Private key of a funded wallet (will pay gas)
RELAYER_PRIVATE_KEY=0x...

# TangleMigration contract address
MIGRATION_CONTRACT=0xffa7ca1aeeebbc30c874d32c7e22f052bbea0429

# RPC endpoint
RPC_URL=http://localhost:8545

# Chain ID
CHAIN_ID=31337

# Server port
PORT=3001
```

### 3. Fund the relayer wallet

The relayer wallet needs ETH to pay for gas. For local testing with Anvil:

```bash
# Get the relayer address from your private key, then fund it:
cast send <RELAYER_ADDRESS> --value 10ether --private-key <ANVIL_PRIVATE_KEY>
```

For production, transfer ETH to the relayer address.

### 4. Run the relayer

Development mode (auto-reload):
```bash
yarn dev
```

Production:
```bash
yarn build
yarn start
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "relayer": "0x...",
  "balance": "10000000000000000000",
  "contract": "0x...",
  "chainId": 31337,
  "paused": false
}
```

### Submit Claim
```
POST /claim
Content-Type: application/json

{
  "pubkey": "0x...",      // 32-byte Substrate pubkey (bytes32)
  "amount": "1000...",    // Amount in wei (string)
  "merkleProof": [...],   // Merkle proof array
  "zkProof": "0x...",     // ZK proof bytes
  "recipient": "0x..."    // EVM address to receive tokens
}
```

Success response:
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": "123",
  "gasUsed": "150000"
}
```

Error response:
```json
{
  "error": "Claim failed",
  "message": "Invalid merkle proof - this address may not be eligible"
}
```

### Check Claim Status
```
GET /status/:pubkey
```

Response:
```json
{
  "pubkey": "0x...",
  "claimed": true,
  "claimedAmount": "1000000000000000000"
}
```

## Frontend Integration

Set the environment variable in your frontend:

```env
VITE_CLAIM_RELAYER_URL=http://localhost:3001
```

The frontend will automatically use the relayer when:
- The relayer URL is configured
- The user doesn't have enough ETH for gas

## Security Considerations

1. **Rate Limiting**: The relayer includes basic rate limiting (10 requests/minute per IP)

2. **Relayer Wallet**: Use a dedicated wallet for the relayer - never your personal wallet

3. **Gas Limits**: Consider adding gas price limits in production to prevent draining during gas spikes

4. **Monitoring**: Monitor the relayer wallet balance and set up alerts

5. **Access Control**: For production, consider adding:
   - API key authentication
   - IP allowlisting
   - Request signing

## Deployment Options

### Option 1: Simple VPS
Deploy on any VPS (DigitalOcean, AWS EC2, etc.) with Node.js

### Option 2: Serverless (Vercel/Netlify)
Convert to serverless function - the endpoint is stateless

### Option 3: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
CMD ["yarn", "start"]
```

## Monitoring

Check relayer health and balance:
```bash
curl http://localhost:3001/health
```

Watch logs for claim activity:
```bash
yarn dev 2>&1 | grep CLAIM
```
