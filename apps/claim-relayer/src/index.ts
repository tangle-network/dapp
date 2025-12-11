import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  createWalletClient,
  createPublicClient,
  http,
  type Hex,
  type Address,
  parseAbi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost, baseSepolia, base } from 'viem/chains';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 3001;
const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as Hex;
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '31337');
const MIGRATION_CONTRACT = process.env.MIGRATION_CONTRACT as Address;

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// ============================================================================
// VALIDATION
// ============================================================================

if (!PRIVATE_KEY) {
  console.error('ERROR: RELAYER_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

if (!MIGRATION_CONTRACT) {
  console.error('ERROR: MIGRATION_CONTRACT environment variable is required');
  process.exit(1);
}

// ============================================================================
// SETUP
// ============================================================================

// Get chain config
const getChain = () => {
  switch (CHAIN_ID) {
    case 31337:
    case 1337:
      return { ...localhost, id: CHAIN_ID };
    case 84532:
      return baseSepolia;
    case 8453:
      return base;
    default:
      return { ...localhost, id: CHAIN_ID };
  }
};

const chain = getChain();
const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

// TangleMigration ABI (only what we need)
const migrationAbi = parseAbi([
  'function claimWithZKProof(bytes32 pubkey, uint256 amount, bytes32[] calldata merkleProof, bytes calldata zkProof, address recipient) external',
  'function claimed(bytes32 pubkey) external view returns (uint256)',
  'function paused() external view returns (bool)',
]);

// ============================================================================
// EXPRESS APP
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (_req, res) => {
  try {
    const balance = await publicClient.getBalance({ address: account.address });
    const isPaused = await publicClient.readContract({
      address: MIGRATION_CONTRACT,
      abi: migrationAbi,
      functionName: 'paused',
    });

    res.json({
      status: 'ok',
      relayer: account.address,
      balance: balance.toString(),
      contract: MIGRATION_CONTRACT,
      chainId: CHAIN_ID,
      paused: isPaused,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Claim endpoint
app.post('/claim', async (req, res) => {
  const startTime = Date.now();

  try {
    // Rate limiting by IP
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const rateLimit = rateLimitMap.get(clientIp);

    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
          return res.status(429).json({
            error: 'Too many requests',
            message: 'Please wait before submitting another claim',
          });
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(clientIp, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
      }
    } else {
      rateLimitMap.set(clientIp, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    // Parse request body
    const { pubkey, amount, merkleProof, zkProof, recipient } = req.body;

    // Validate inputs
    if (!pubkey || !amount || !merkleProof || !zkProof || !recipient) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Required: pubkey, amount, merkleProof, zkProof, recipient',
      });
    }

    // Validate hex formats
    if (!pubkey.startsWith('0x') || pubkey.length !== 66) {
      return res.status(400).json({
        error: 'Invalid pubkey',
        message: 'Pubkey must be a 32-byte hex string (0x + 64 chars)',
      });
    }

    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      return res.status(400).json({
        error: 'Invalid recipient',
        message: 'Recipient must be a valid Ethereum address',
      });
    }

    // Check if already claimed
    const alreadyClaimed = await publicClient.readContract({
      address: MIGRATION_CONTRACT,
      abi: migrationAbi,
      functionName: 'claimed',
      args: [pubkey as Hex],
    });

    if (alreadyClaimed > BigInt(0)) {
      return res.status(400).json({
        error: 'Already claimed',
        message: 'This pubkey has already claimed tokens',
      });
    }

    // Check if paused
    const isPaused = await publicClient.readContract({
      address: MIGRATION_CONTRACT,
      abi: migrationAbi,
      functionName: 'paused',
    });

    if (isPaused) {
      return res.status(503).json({
        error: 'Claims paused',
        message: 'Claims are currently paused',
      });
    }

    console.log(
      `[CLAIM] Processing claim for pubkey ${pubkey.slice(0, 10)}... to ${recipient}`,
    );

    // Submit the claim transaction
    const hash = await walletClient.writeContract({
      address: MIGRATION_CONTRACT,
      abi: migrationAbi,
      functionName: 'claimWithZKProof',
      args: [
        pubkey as Hex,
        BigInt(amount),
        merkleProof as Hex[],
        zkProof as Hex,
        recipient as Address,
      ],
    });

    console.log(`[CLAIM] Transaction submitted: ${hash}`);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const duration = Date.now() - startTime;
    console.log(
      `[CLAIM] Confirmed in block ${receipt.blockNumber} (${duration}ms)`,
    );

    res.json({
      success: true,
      txHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (error) {
    console.error('[CLAIM] Error:', error);

    // Parse revert reason if available
    let message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('InvalidMerkleProof')) {
      message = 'Invalid merkle proof - this address may not be eligible';
    } else if (message.includes('InvalidZKProof')) {
      message = 'Invalid ZK proof - signature verification failed';
    } else if (message.includes('AlreadyClaimed')) {
      message = 'This address has already claimed';
    } else if (message.includes('ClaimsPaused')) {
      message = 'Claims are currently paused';
    } else if (message.includes('ClaimDeadlinePassed')) {
      message = 'The claim deadline has passed';
    }

    res.status(500).json({
      error: 'Claim failed',
      message,
    });
  }
});

// Get claim status
app.get('/status/:pubkey', async (req, res) => {
  try {
    const { pubkey } = req.params;

    if (!pubkey.startsWith('0x') || pubkey.length !== 66) {
      return res.status(400).json({
        error: 'Invalid pubkey',
        message: 'Pubkey must be a 32-byte hex string',
      });
    }

    const claimedAmount = await publicClient.readContract({
      address: MIGRATION_CONTRACT,
      abi: migrationAbi,
      functionName: 'claimed',
      args: [pubkey as Hex],
    });

    res.json({
      pubkey,
      claimed: claimedAmount > BigInt(0),
      claimedAmount: claimedAmount.toString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('  TNT Migration Claim Relayer');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log(`  Port:     ${PORT}`);
  console.log(`  Chain:    ${chain.name || 'Custom'} (${CHAIN_ID})`);
  console.log(`  RPC:      ${RPC_URL}`);
  console.log(`  Contract: ${MIGRATION_CONTRACT}`);
  console.log(`  Relayer:  ${account.address}`);
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /health          - Health check & relayer balance`);
  console.log(`  POST /claim           - Submit a gasless claim`);
  console.log(`  GET  /status/:pubkey  - Check claim status`);
  console.log('');
});
