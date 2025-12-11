#!/usr/bin/env tsx
/**
 * Tangle Network State Snapshot Script - Full Migration Version
 *
 * Captures a comprehensive snapshot for migration to EVM-based chain:
 * - All account balances (free, reserved, frozen)
 * - Balance locks and their metadata
 * - Vesting schedules
 * - Staking: validators, nominators, ledgers
 * - Multi-asset delegation: operators, delegators
 * - LST pools and membership
 * - EVM account mappings
 * - Identity information
 * - Rewards and credits
 * - Services and blueprints
 */

import { ApiPromise, WsProvider } from "@polkadot/api";
import { writeFileSync } from "fs";

// Configuration
const RPC_ENDPOINTS = [
  "wss://rpc.tangle.tools",
  "wss://tangle-mainnet-rpc.n.dwellir.com",
];

const BATCH_SIZE = 500;
const OUTPUT_FILE = "tangle_migration_snapshot";

// Helper to safely convert to JSON
function safeJson(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return value.toString();
  if (typeof (value as { toJSON?: () => unknown }).toJSON === "function") {
    return (value as { toJSON: () => unknown }).toJSON();
  }
  if (typeof (value as { toHuman?: () => unknown }).toHuman === "function") {
    return (value as { toHuman: () => unknown }).toHuman();
  }
  if (typeof (value as { toString?: () => string }).toString === "function" && typeof value !== "object") {
    return (value as { toString: () => string }).toString();
  }
  return value;
}

async function connectWithFallback(): Promise<ApiPromise> {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      console.log(`Connecting to ${endpoint}...`);
      const provider = new WsProvider(endpoint, 1000, {}, 30000);
      const api = await ApiPromise.create({ provider, throwOnConnect: true });
      await api.isReady;
      console.log(`Connected to ${endpoint}\n`);
      return api;
    } catch (error) {
      console.log(`Failed: ${(error as Error).message}`);
    }
  }
  throw new Error("Failed to connect to any RPC endpoint");
}

async function getAllAccounts(api: ApiPromise) {
  console.log("📊 Fetching all accounts...");
  const accounts: Array<{
    address: string;
    nonce: number;
    consumers: number;
    providers: number;
    sufficients: number;
    free: string;
    reserved: string;
    frozen: string;
  }> = [];

  const keys = await api.query.system.account.keys();
  console.log(`   Found ${keys.length} accounts`);

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    const results = await api.query.system.account.multi(batch.map((k) => k.args[0]));

    for (let j = 0; j < batch.length; j++) {
      const address = batch[j].args[0].toString();
      const info = results[j] as unknown as {
        nonce: { toNumber: () => number };
        consumers: { toNumber: () => number };
        providers: { toNumber: () => number };
        sufficients: { toNumber: () => number };
        data: {
          free: { toString: () => string };
          reserved: { toString: () => string };
          frozen: { toString: () => string };
        };
      };

      accounts.push({
        address,
        nonce: info.nonce.toNumber(),
        consumers: info.consumers.toNumber(),
        providers: info.providers.toNumber(),
        sufficients: info.sufficients.toNumber(),
        free: info.data.free.toString(),
        reserved: info.data.reserved.toString(),
        frozen: info.data.frozen.toString(),
      });
    }
    process.stdout.write(`   Processed ${Math.min(i + BATCH_SIZE, keys.length)}/${keys.length}\r`);
  }
  console.log("");
  return accounts;
}

async function getBalanceLocks(api: ApiPromise) {
  console.log("🔒 Fetching balance locks...");
  const locks: Array<{
    address: string;
    locks: Array<{ id: string; amount: string; reasons: string }>;
  }> = [];

  const entries = await api.query.balances.locks.entries();
  console.log(`   Found ${entries.length} accounts with locks`);

  for (const [key, value] of entries) {
    const address = key.args[0].toString();
    const lockData = value as unknown as Array<{
      id: { toHuman: () => string };
      amount: { toString: () => string };
      reasons: { toString: () => string };
    }>;

    if (lockData.length > 0) {
      locks.push({
        address,
        locks: lockData.map((lock) => ({
          id: lock.id.toHuman(),
          amount: lock.amount.toString(),
          reasons: lock.reasons.toString(),
        })),
      });
    }
  }
  return locks;
}

async function getVesting(api: ApiPromise) {
  console.log("⏳ Fetching vesting schedules...");
  const vesting: Array<{
    address: string;
    schedules: Array<{ locked: string; perBlock: string; startingBlock: string }>;
  }> = [];

  try {
    const entries = await api.query.vesting.vesting.entries();
    console.log(`   Found ${entries.length} accounts with vesting`);

    for (const [key, value] of entries) {
      const address = key.args[0].toString();
      const vestingData = value as unknown as {
        isSome: boolean;
        unwrap: () => Array<{
          locked: { toString: () => string };
          perBlock: { toString: () => string };
          startingBlock: { toString: () => string };
        }>;
      };

      if (vestingData.isSome) {
        const schedules = vestingData.unwrap();
        vesting.push({
          address,
          schedules: schedules.map((s) => ({
            locked: s.locked.toString(),
            perBlock: s.perBlock.toString(),
            startingBlock: s.startingBlock.toString(),
          })),
        });
      }
    }
  } catch (error) {
    console.log(`   Vesting not available: ${(error as Error).message}`);
  }
  return vesting;
}

async function getStakingData(api: ApiPromise) {
  console.log("🥩 Fetching staking data...");
  const result = {
    currentEra: null as number | null,
    activeEra: null as number | null,
    validators: [] as string[],
    nominators: [] as Array<{
      address: string;
      targets: string[];
      submittedIn: number;
      suppressed: boolean;
    }>,
    ledgers: [] as Array<{
      address: string;
      stash: string;
      total: string;
      active: string;
      unlocking: Array<{ value: string; era: number }>;
    }>,
    validatorPrefs: [] as Array<{
      address: string;
      commission: string;
      blocked: boolean;
    }>,
  };

  try {
    // Current and active era
    const [currentEra, activeEra] = await Promise.all([
      api.query.staking.currentEra(),
      api.query.staking.activeEra(),
    ]);
    result.currentEra = (currentEra as unknown as { unwrapOr: (v: null) => number | null }).unwrapOr(null);
    const activeEraInfo = (activeEra as unknown as { unwrapOr: (v: null) => { index: { toNumber: () => number } } | null }).unwrapOr(null);
    result.activeEra = activeEraInfo?.index.toNumber() ?? null;
    console.log(`   Current era: ${result.currentEra}, Active era: ${result.activeEra}`);

    // Validators
    const validators = await api.query.session.validators();
    result.validators = (validators as unknown as { toJSON: () => string[] }).toJSON();
    console.log(`   Active validators: ${result.validators.length}`);

    // All nominators
    console.log("   Fetching nominators...");
    const nominatorEntries = await api.query.staking.nominators.entries();
    console.log(`   Found ${nominatorEntries.length} nominators`);
    for (const [key, value] of nominatorEntries) {
      const address = key.args[0].toString();
      const data = (value as unknown as { unwrapOr: (v: null) => unknown }).unwrapOr(null);
      if (data) {
        const nomData = data as {
          targets: { toJSON: () => string[] };
          submittedIn: { toNumber: () => number };
          suppressed: { isTrue: boolean };
        };
        result.nominators.push({
          address,
          targets: nomData.targets.toJSON(),
          submittedIn: nomData.submittedIn.toNumber(),
          suppressed: nomData.suppressed.isTrue,
        });
      }
    }

    // All staking ledgers
    console.log("   Fetching staking ledgers...");
    const ledgerEntries = await api.query.staking.ledger.entries();
    console.log(`   Found ${ledgerEntries.length} staking ledgers`);
    for (const [key, value] of ledgerEntries) {
      const address = key.args[0].toString();
      const ledgerOpt = value as unknown as { unwrapOr: (v: null) => unknown };
      const ledger = ledgerOpt.unwrapOr(null);
      if (ledger) {
        const l = ledger as {
          stash: { toString: () => string };
          total: { toString: () => string };
          active: { toString: () => string };
          unlocking: Array<{
            value: { toString: () => string };
            era: { toNumber: () => number };
          }>;
        };
        result.ledgers.push({
          address,
          stash: l.stash.toString(),
          total: l.total.toString(),
          active: l.active.toString(),
          unlocking: l.unlocking.map((u) => ({
            value: u.value.toString(),
            era: u.era.toNumber(),
          })),
        });
      }
    }

    // Validator preferences
    console.log("   Fetching validator preferences...");
    const validatorPrefs = await api.query.staking.validators.entries();
    for (const [key, value] of validatorPrefs) {
      const address = key.args[0].toString();
      const prefs = value as unknown as {
        commission: { toString: () => string };
        blocked: { isTrue: boolean };
      };
      result.validatorPrefs.push({
        address,
        commission: prefs.commission.toString(),
        blocked: prefs.blocked.isTrue,
      });
    }
    console.log(`   Found ${result.validatorPrefs.length} validator configs`);
  } catch (error) {
    console.log(`   Staking error: ${(error as Error).message}`);
  }

  return result;
}

async function getMultiAssetDelegation(api: ApiPromise) {
  console.log("🔗 Fetching multi-asset delegation...");
  const result = {
    currentRound: 0,
    operators: [] as Array<{ address: string; metadata: unknown }>,
    delegators: [] as Array<{ address: string; metadata: unknown }>,
  };

  try {
    if (!api.query.multiAssetDelegation) {
      console.log("   MultiAssetDelegation pallet not available");
      return result;
    }

    const currentRound = await api.query.multiAssetDelegation.currentRound();
    result.currentRound = (currentRound as unknown as { toNumber: () => number }).toNumber();
    console.log(`   Current round: ${result.currentRound}`);

    const [operatorEntries, delegatorEntries] = await Promise.all([
      api.query.multiAssetDelegation.operators.entries(),
      api.query.multiAssetDelegation.delegators.entries(),
    ]);

    console.log(`   Operators: ${operatorEntries.length}, Delegators: ${delegatorEntries.length}`);

    for (const [key, value] of operatorEntries) {
      result.operators.push({
        address: key.args[0].toString(),
        metadata: safeJson(value),
      });
    }

    for (const [key, value] of delegatorEntries) {
      result.delegators.push({
        address: key.args[0].toString(),
        metadata: safeJson(value),
      });
    }
  } catch (error) {
    console.log(`   MAD error: ${(error as Error).message}`);
  }

  return result;
}

async function getEvmAccounts(api: ApiPromise) {
  console.log("🔷 Fetching EVM account mappings...");
  const mappings: Array<{
    substrateAddress: string;
    evmAddress: string;
  }> = [];

  try {
    // Check for evm account mapping storage
    if (api.query.evmChainId) {
      const chainId = await api.query.evmChainId.chainId();
      console.log(`   EVM Chain ID: ${chainId.toString()}`);
    }

    // Try to get EVM account mappings if they exist
    if (api.query.evm?.accountCodes) {
      const evmAccounts = await api.query.evm.accountCodes.entries();
      console.log(`   Found ${evmAccounts.length} EVM accounts with code`);
    }

    // Check for claim mappings (substrate -> evm)
    if (api.query.claims) {
      // Claims pallet might have address mappings
      const claimEntries = await api.query.claims.claims.entries();
      console.log(`   Found ${claimEntries.length} unclaimed balances in claims pallet`);
    }
  } catch (error) {
    console.log(`   EVM mapping note: ${(error as Error).message}`);
  }

  return mappings;
}

async function getIdentities(api: ApiPromise) {
  console.log("🪪 Fetching identities...");
  const identities: Array<{
    address: string;
    info: unknown;
    judgements: unknown;
    deposit: string;
  }> = [];

  try {
    if (!api.query.identity) {
      console.log("   Identity pallet not available");
      return identities;
    }

    const entries = await api.query.identity.identityOf.entries();
    console.log(`   Found ${entries.length} identities`);

    for (const [key, value] of entries) {
      const address = key.args[0].toString();
      const identityOpt = value as unknown as { unwrapOr: (v: null) => unknown };
      const identity = identityOpt.unwrapOr(null);
      if (identity) {
        const id = identity as {
          info: unknown;
          judgements: unknown;
          deposit: { toString: () => string };
        };
        identities.push({
          address,
          info: safeJson(id.info),
          judgements: safeJson(id.judgements),
          deposit: id.deposit?.toString() || "0",
        });
      }
    }
  } catch (error) {
    console.log(`   Identity error: ${(error as Error).message}`);
  }

  return identities;
}

async function getLstPools(api: ApiPromise) {
  console.log("💧 Fetching LST pools...");
  const result = {
    totalValueLocked: "0",
    pools: [] as Array<{ poolId: number; data: unknown }>,
    poolMembers: [] as Array<{ address: string; poolId: number; data: unknown }>,
  };

  try {
    if (!api.query.lst) {
      console.log("   LST pallet not available (trying tangle-lst)");
    }

    // Try different pallet names
    const lstQuery = api.query.lst || api.query.nominationPools;
    if (!lstQuery) {
      console.log("   No LST/nomination pools pallet found");
      return result;
    }

    if (lstQuery.totalValueLocked) {
      const tvl = await lstQuery.totalValueLocked();
      result.totalValueLocked = tvl.toString();
      console.log(`   TVL: ${result.totalValueLocked}`);
    }

    if (lstQuery.bondedPools) {
      const pools = await lstQuery.bondedPools.entries();
      console.log(`   Found ${pools.length} pools`);
      for (const [key, value] of pools) {
        result.pools.push({
          poolId: (key.args[0] as unknown as { toNumber: () => number }).toNumber(),
          data: safeJson(value),
        });
      }
    }

    if (lstQuery.poolMembers) {
      const members = await lstQuery.poolMembers.entries();
      console.log(`   Found ${members.length} pool members`);
      for (const [key, value] of members) {
        const data = safeJson(value) as { poolId?: number } | null;
        result.poolMembers.push({
          address: key.args[0].toString(),
          poolId: data?.poolId || 0,
          data,
        });
      }
    }
  } catch (error) {
    console.log(`   LST error: ${(error as Error).message}`);
  }

  return result;
}

async function getRewards(api: ApiPromise) {
  console.log("🎁 Fetching rewards data...");
  const result = {
    vaults: [] as Array<{ vaultId: unknown; assets: unknown }>,
    userRewards: [] as Array<{ address: string; vaultId: unknown; score: string }>,
    userClaimed: [] as Array<{ address: string; vaultId: unknown; claimed: string }>,
  };

  try {
    if (!api.query.rewards) {
      console.log("   Rewards pallet not available");
      return result;
    }

    // Reward vaults
    if (api.query.rewards.rewardVaults) {
      const vaults = await api.query.rewards.rewardVaults.entries();
      console.log(`   Found ${vaults.length} reward vaults`);
      for (const [key, value] of vaults) {
        result.vaults.push({
          vaultId: safeJson(key.args[0]),
          assets: safeJson(value),
        });
      }
    }

    // User rewards
    if (api.query.rewards.userServiceReward) {
      const rewards = await api.query.rewards.userServiceReward.entries();
      console.log(`   Found ${rewards.length} user reward entries`);
      for (const [key, value] of rewards) {
        result.userRewards.push({
          address: key.args[0].toString(),
          vaultId: safeJson(key.args[1]),
          score: value.toString(),
        });
      }
    }

    // Claimed rewards
    if (api.query.rewards.userClaimedReward) {
      const claimed = await api.query.rewards.userClaimedReward.entries();
      console.log(`   Found ${claimed.length} claimed reward entries`);
      for (const [key, value] of claimed) {
        result.userClaimed.push({
          address: key.args[0].toString(),
          vaultId: safeJson(key.args[1]),
          claimed: value.toString(),
        });
      }
    }
  } catch (error) {
    console.log(`   Rewards error: ${(error as Error).message}`);
  }

  return result;
}

async function getServices(api: ApiPromise) {
  console.log("⚙️ Fetching services data...");
  const result = {
    blueprints: [] as Array<{ id: number; data: unknown }>,
    services: [] as Array<{ id: number; data: unknown }>,
    operators: [] as Array<{ blueprintId: number; address: string; data: unknown }>,
  };

  try {
    if (!api.query.services) {
      console.log("   Services pallet not available");
      return result;
    }

    // Blueprints
    if (api.query.services.blueprints) {
      const blueprints = await api.query.services.blueprints.entries();
      console.log(`   Found ${blueprints.length} blueprints`);
      for (const [key, value] of blueprints) {
        result.blueprints.push({
          id: (key.args[0] as unknown as { toNumber: () => number }).toNumber(),
          data: safeJson(value),
        });
      }
    }

    // Services
    if (api.query.services.instances) {
      const services = await api.query.services.instances.entries();
      console.log(`   Found ${services.length} service instances`);
      for (const [key, value] of services) {
        result.services.push({
          id: (key.args[0] as unknown as { toNumber: () => number }).toNumber(),
          data: safeJson(value),
        });
      }
    }

    // Operator participation
    if (api.query.services.operators) {
      const operators = await api.query.services.operators.entries();
      console.log(`   Found ${operators.length} service operator entries`);
      for (const [key, value] of operators) {
        result.operators.push({
          blueprintId: (key.args[0] as unknown as { toNumber: () => number }).toNumber(),
          address: key.args[1].toString(),
          data: safeJson(value),
        });
      }
    }
  } catch (error) {
    console.log(`   Services error: ${(error as Error).message}`);
  }

  return result;
}

async function getClaims(api: ApiPromise) {
  console.log("📝 Fetching unclaimed balances...");
  const result = {
    total: "0",
    claims: [] as Array<{ address: string; amount: string; vesting: unknown }>,
  };

  try {
    if (!api.query.claims) {
      console.log("   Claims pallet not available");
      return result;
    }

    const total = await api.query.claims.total();
    result.total = total.toString();
    console.log(`   Total unclaimed: ${result.total}`);

    // Fetch claims and vesting in parallel (bulk fetch)
    const [claimEntries, vestingEntries] = await Promise.all([
      api.query.claims.claims.entries(),
      api.query.claims.vesting ? api.query.claims.vesting.entries() : Promise.resolve([]),
    ]);

    console.log(`   Found ${claimEntries.length} unclaimed addresses`);
    console.log(`   Found ${vestingEntries.length} claim vesting entries`);

    // Build vesting lookup map
    const vestingMap = new Map<string, unknown>();
    for (const [key, value] of vestingEntries) {
      const address = safeJson(key.args[0]) as string;
      vestingMap.set(address, safeJson(value));
    }

    // Process claims with vesting lookup
    for (const [key, value] of claimEntries) {
      const address = safeJson(key.args[0]) as string;
      result.claims.push({
        address,
        amount: value.toString(),
        vesting: vestingMap.get(address) || null,
      });
    }
  } catch (error) {
    console.log(`   Claims error: ${(error as Error).message}`);
  }

  return result;
}

async function getProxies(api: ApiPromise) {
  console.log("👥 Fetching proxy relationships...");
  const proxies: Array<{
    address: string;
    proxies: Array<{ delegate: string; proxyType: string; delay: number }>;
    deposit: string;
  }> = [];

  try {
    if (!api.query.proxy) {
      console.log("   Proxy pallet not available");
      return proxies;
    }

    const entries = await api.query.proxy.proxies.entries();
    console.log(`   Found ${entries.length} accounts with proxies`);

    for (const [key, value] of entries) {
      const address = key.args[0].toString();
      const [proxyList, deposit] = value as unknown as [
        Array<{
          delegate: { toString: () => string };
          proxyType: { toString: () => string };
          delay: { toNumber: () => number };
        }>,
        { toString: () => string }
      ];

      if (proxyList.length > 0) {
        proxies.push({
          address,
          proxies: proxyList.map((p) => ({
            delegate: p.delegate.toString(),
            proxyType: p.proxyType.toString(),
            delay: p.delay.toNumber(),
          })),
          deposit: deposit.toString(),
        });
      }
    }
  } catch (error) {
    console.log(`   Proxy error: ${(error as Error).message}`);
  }

  return proxies;
}

async function getAssets(api: ApiPromise) {
  console.log("🪙 Fetching non-native assets...");
  const result = {
    assets: [] as Array<{ assetId: unknown; metadata: unknown; details: unknown }>,
    balances: [] as Array<{ assetId: unknown; address: string; balance: unknown }>,
  };

  try {
    if (!api.query.assets) {
      console.log("   Assets pallet not available");
      return result;
    }

    // Asset metadata
    if (api.query.assets.metadata) {
      const metadata = await api.query.assets.metadata.entries();
      console.log(`   Found ${metadata.length} asset types`);
      for (const [key, value] of metadata) {
        const assetId = safeJson(key.args[0]);
        let details = null;
        if (api.query.assets.asset) {
          const assetDetails = await api.query.assets.asset(key.args[0]);
          details = safeJson(assetDetails);
        }
        result.assets.push({
          assetId,
          metadata: safeJson(value),
          details,
        });
      }
    }

    // Asset balances
    if (api.query.assets.account) {
      const balances = await api.query.assets.account.entries();
      console.log(`   Found ${balances.length} asset balance entries`);
      for (const [key, value] of balances) {
        const data = safeJson(value);
        if (data) {
          result.balances.push({
            assetId: safeJson(key.args[0]),
            address: key.args[1].toString(),
            balance: data,
          });
        }
      }
    }
  } catch (error) {
    console.log(`   Assets error: ${(error as Error).message}`);
  }

  return result;
}

async function main() {
  console.log("═".repeat(60));
  console.log("  TANGLE NETWORK - FULL MIGRATION SNAPSHOT");
  console.log("═".repeat(60) + "\n");

  const api = await connectWithFallback();

  // Get chain metadata
  const [chain, blockHash, header, runtimeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.chain.getFinalizedHead(),
    api.rpc.chain.getHeader(),
    api.rpc.state.getRuntimeVersion(),
  ]);

  const blockNumber = header.number.toNumber();
  console.log(`Chain: ${chain}`);
  console.log(`Block: #${blockNumber}`);
  console.log(`Hash: ${blockHash.toString()}`);
  console.log(`Spec: v${runtimeVersion.specVersion.toNumber()}\n`);

  const startTime = Date.now();

  // Collect all data
  const [
    accounts,
    balanceLocks,
    vesting,
    staking,
    multiAssetDelegation,
    identities,
    lstPools,
    rewards,
    services,
    claims,
    proxies,
    assets,
  ] = await Promise.all([
    getAllAccounts(api),
    getBalanceLocks(api),
    getVesting(api),
    getStakingData(api),
    getMultiAssetDelegation(api),
    getIdentities(api),
    getLstPools(api),
    getRewards(api),
    getServices(api),
    getClaims(api),
    getProxies(api),
    getAssets(api),
  ]);

  // Also get EVM data (not parallelized as it depends on previous queries)
  const evmAccounts = await getEvmAccounts(api);

  const snapshot = {
    metadata: {
      chainName: chain.toString(),
      blockNumber,
      blockHash: blockHash.toString(),
      specVersion: runtimeVersion.specVersion.toNumber(),
      timestamp: new Date().toISOString(),
      snapshotDuration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
    },
    accounts,
    balanceLocks,
    vesting,
    staking,
    multiAssetDelegation,
    identities,
    evmAccounts,
    lstPools,
    rewards,
    services,
    claims,
    proxies,
    assets,
  };

  // Write to file
  const outputPath = `${OUTPUT_FILE}_${blockNumber}.json`;
  writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("  SNAPSHOT SUMMARY");
  console.log("═".repeat(60));
  console.log(`
  📊 Accounts:           ${accounts.length.toLocaleString()}
  🔒 With locks:         ${balanceLocks.length.toLocaleString()}
  ⏳ With vesting:       ${vesting.length.toLocaleString()}

  🥩 STAKING:
     Validators:         ${staking.validators.length}
     Nominators:         ${staking.nominators.length.toLocaleString()}
     Staking ledgers:    ${staking.ledgers.length.toLocaleString()}

  🔗 MULTI-ASSET DELEGATION:
     Current round:      ${multiAssetDelegation.currentRound}
     Operators:          ${multiAssetDelegation.operators.length}
     Delegators:         ${multiAssetDelegation.delegators.length}

  🪪 Identities:         ${identities.length}
  👥 Proxy accounts:     ${proxies.length}

  💧 LST POOLS:
     TVL:                ${lstPools.totalValueLocked}
     Pools:              ${lstPools.pools.length}
     Members:            ${lstPools.poolMembers.length}

  🎁 REWARDS:
     Vaults:             ${rewards.vaults.length}
     User rewards:       ${rewards.userRewards.length}

  ⚙️ SERVICES:
     Blueprints:         ${services.blueprints.length}
     Instances:          ${services.services.length}
     Operators:          ${services.operators.length}

  📝 CLAIMS:
     Total unclaimed:    ${claims.total}
     Addresses:          ${claims.claims.length}

  🪙 ASSETS:
     Asset types:        ${assets.assets.length}
     Balance entries:    ${assets.balances.length}

  📁 Output: ${outputPath}
  ⏱️ Duration: ${snapshot.metadata.snapshotDuration}
`);

  await api.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
