#!/usr/bin/env node
import { execFileSync, execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  keccak256,
  parseEventLogs,
  toHex,
  zeroAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAPP_ROOT = resolve(__dirname, '../..');
const GENERATED_DIR = resolve(__dirname, 'blueprint-ui-catalog/generated');

const PORT = Number(process.env.BLUEPRINT_UI_CATALOG_PORT ?? 3337);
const HOST = process.env.BLUEPRINT_UI_CATALOG_HOST ?? '127.0.0.1';
const PUBLIC_HOST = process.env.BLUEPRINT_UI_CATALOG_PUBLIC_HOST ?? HOST;
const PUBLIC_PORT = Number(
  process.env.BLUEPRINT_UI_CATALOG_PUBLIC_PORT ?? PORT,
);
const RPC_URL = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
const TANGLE_ADDRESS = getAddress(
  process.env.TANGLE_ADDRESS ?? '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
);
// Deterministic addresses from script/LocalTestnet.s.sol's deploy order.
// Override only if you re-shuffle the deploy script.
const STAKING_ADDRESS = getAddress(
  process.env.STAKING_ADDRESS ?? '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
);
const TNT_TOKEN_ADDRESS = getAddress(
  process.env.TNT_TOKEN_ADDRESS ?? '0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00',
);
const OPERATOR_BOND = 100n * 10n ** 18n; // 100 TNT

const DEPLOYER_KEY =
  process.env.BLUEPRINT_UI_DEPLOYER_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const OPERATOR_KEYS = [
  process.env.BLUEPRINT_UI_OPERATOR1_KEY ??
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  process.env.BLUEPRINT_UI_OPERATOR2_KEY ??
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
];
const OPERATOR_GOSSIP_KEYS = [
  '0x040102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40',
  '0x044142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f80',
];

// Where blueprint repos live on disk, relative to BLUEPRINT_ROOT
// (defaults to ~/code so the script works for any operator).
const BLUEPRINT_ROOT = process.env.BLUEPRINT_ROOT ?? `${process.env.HOME}/code`;
const WEBB_ROOT = resolve(DAPP_ROOT, '..');
const firstExistingPath = (...paths) =>
  paths.find((path) => existsSync(path)) ?? paths[0];
const BLUEPRINTS = [
  ['ai-agent-sandbox', `${BLUEPRINT_ROOT}/ai-agent-sandbox-blueprint`],
  [
    'ai-trading',
    process.env.AI_TRADING_BLUEPRINT_PATH ??
      firstExistingPath(
        `${WEBB_ROOT}/ai-trading-blueprint`,
        `${BLUEPRINT_ROOT}/ai-trading-blueprint`,
        `${BLUEPRINT_ROOT}/ai-trading-blueprints`,
      ),
  ],
  ['llm-inference', `${BLUEPRINT_ROOT}/llm-inference-blueprint`],
  ['voice-inference', `${BLUEPRINT_ROOT}/voice-inference-blueprint`],
  ['embedding-inference', `${BLUEPRINT_ROOT}/embedding-inference-blueprint`],
  [
    'distributed-inference',
    `${BLUEPRINT_ROOT}/distributed-inference-blueprint`,
  ],
  ['avatar-inference', `${BLUEPRINT_ROOT}/avatar-inference-blueprint`],
  ['image-generation', `${BLUEPRINT_ROOT}/image-gen-inference-blueprint`],
  ['modal-inference', `${BLUEPRINT_ROOT}/modal-inference-blueprint`],
  ['video-generation', `${BLUEPRINT_ROOT}/video-gen-inference-blueprint`],
  ['distributed-training', `${BLUEPRINT_ROOT}/training-blueprint`],
  ['vector-store', `${BLUEPRINT_ROOT}/vector-store-blueprint`],
];

const tangleAbi = [
  {
    type: 'function',
    name: 'createBlueprint',
    inputs: [
      {
        name: 'definition',
        type: 'tuple',
        components: [
          { name: 'metadataUri', type: 'string' },
          { name: 'metadataHash', type: 'bytes32' },
          { name: 'manager', type: 'address' },
          { name: 'masterManagerRevision', type: 'uint32' },
          { name: 'hasConfig', type: 'bool' },
          {
            name: 'config',
            type: 'tuple',
            components: [
              { name: 'membership', type: 'uint8' },
              { name: 'pricing', type: 'uint8' },
              { name: 'minOperators', type: 'uint32' },
              { name: 'maxOperators', type: 'uint32' },
              { name: 'subscriptionRate', type: 'uint256' },
              { name: 'subscriptionInterval', type: 'uint64' },
              { name: 'eventRate', type: 'uint256' },
            ],
          },
          {
            name: 'metadata',
            type: 'tuple',
            components: [
              { name: 'name', type: 'string' },
              { name: 'description', type: 'string' },
              { name: 'author', type: 'string' },
              { name: 'category', type: 'string' },
              { name: 'codeRepository', type: 'string' },
              { name: 'logo', type: 'string' },
              { name: 'website', type: 'string' },
              { name: 'license', type: 'string' },
              { name: 'profilingData', type: 'string' },
            ],
          },
          {
            name: 'jobs',
            type: 'tuple[]',
            components: [
              { name: 'name', type: 'string' },
              { name: 'description', type: 'string' },
              { name: 'metadataUri', type: 'string' },
              { name: 'paramsSchema', type: 'bytes' },
              { name: 'resultSchema', type: 'bytes' },
            ],
          },
          { name: 'registrationSchema', type: 'bytes' },
          { name: 'requestSchema', type: 'bytes' },
          {
            name: 'sources',
            type: 'tuple[]',
            components: [
              { name: 'kind', type: 'uint8' },
              {
                name: 'container',
                type: 'tuple',
                components: [
                  { name: 'registry', type: 'string' },
                  { name: 'image', type: 'string' },
                  { name: 'tag', type: 'string' },
                ],
              },
              {
                name: 'wasm',
                type: 'tuple',
                components: [
                  { name: 'runtime', type: 'uint8' },
                  { name: 'fetcher', type: 'uint8' },
                  { name: 'artifactUri', type: 'string' },
                  { name: 'entrypoint', type: 'string' },
                ],
              },
              {
                name: 'native',
                type: 'tuple',
                components: [
                  { name: 'fetcher', type: 'uint8' },
                  { name: 'artifactUri', type: 'string' },
                  { name: 'entrypoint', type: 'string' },
                ],
              },
              {
                name: 'testing',
                type: 'tuple',
                components: [
                  { name: 'cargoPackage', type: 'string' },
                  { name: 'cargoBin', type: 'string' },
                  { name: 'basePath', type: 'string' },
                ],
              },
              {
                name: 'binaries',
                type: 'tuple[]',
                components: [
                  { name: 'arch', type: 'uint8' },
                  { name: 'os', type: 'uint8' },
                  { name: 'name', type: 'string' },
                  { name: 'sha256', type: 'bytes32' },
                ],
              },
            ],
          },
          { name: 'supportedMemberships', type: 'uint8[]' },
        ],
      },
    ],
    outputs: [{ name: 'blueprintId', type: 'uint64' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isOperatorRegistered',
    inputs: [
      { name: 'blueprintId', type: 'uint64' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateBlueprint',
    inputs: [
      { name: 'blueprintId', type: 'uint64' },
      { name: 'metadataUri', type: 'string' },
      { name: 'metadataHash', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerOperator',
    inputs: [
      { name: 'blueprintId', type: 'uint64' },
      { name: 'ecdsaPublicKey', type: 'bytes' },
      { name: 'rpcAddress', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestService',
    inputs: [
      { name: 'blueprintId', type: 'uint64' },
      { name: 'operators', type: 'address[]' },
      { name: 'config', type: 'bytes' },
      { name: 'permittedCallers', type: 'address[]' },
      { name: 'ttl', type: 'uint64' },
      { name: 'paymentToken', type: 'address' },
      { name: 'paymentAmount', type: 'uint256' },
      { name: 'confidentialityPolicy', type: 'uint8' },
    ],
    outputs: [{ name: 'requestId', type: 'uint64' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'approveService',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'requestId', type: 'uint64' },
          {
            name: 'securityCommitments',
            type: 'tuple[]',
            components: [
              {
                name: 'asset',
                type: 'tuple',
                components: [
                  { name: 'kind', type: 'uint8' },
                  { name: 'token', type: 'address' },
                ],
              },
              { name: 'exposureBps', type: 'uint16' },
            ],
          },
          { name: 'blsPubkey', type: 'uint256[4]' },
          { name: 'blsPopSignature', type: 'uint256[2]' },
          {
            name: 'teeCommitments',
            type: 'tuple[]',
            components: [
              { name: 'backend', type: 'uint8' },
              { name: 'expectedMeasurement', type: 'bytes32' },
              { name: 'nonceBinding', type: 'bytes32' },
              { name: 'expiresAt', type: 'uint64' },
            ],
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'BlueprintCreated',
    inputs: [
      { name: 'blueprintId', type: 'uint64', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'manager', type: 'address', indexed: false },
      { name: 'metadataUri', type: 'string', indexed: false },
      { name: 'metadataHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ServiceRequested',
    inputs: [
      { name: 'requestId', type: 'uint64', indexed: true },
      { name: 'blueprintId', type: 'uint64', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
      { name: 'confidentiality', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ServiceActivated',
    inputs: [
      { name: 'serviceId', type: 'uint64', indexed: true },
      { name: 'requestId', type: 'uint64', indexed: true },
      { name: 'blueprintId', type: 'uint64', indexed: true },
      { name: 'confidentiality', type: 'uint8', indexed: false },
    ],
  },
];

// Minimal ABI for the local-stack operator-staking pre-registration step.
// We use this only to make the catalog's `registerOperator(blueprintId,…)`
// calls succeed locally — the LocalTestnet fixture only stakes operators
// for its single bootstrap blueprint, so the 12 catalog blueprints would
// otherwise revert with OperatorNotActive when their first operator tries
// to register.
const stakingAbi = [
  {
    type: 'function',
    name: 'isOperatorActive',
    inputs: [{ name: 'operator', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerOperatorWithAsset',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];
const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
];

const command = process.argv[2] ?? 'help';

const sortValue = (value) => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = sortValue(value[key]);
        return result;
      }, {});
  }
  return value;
};

const canonicalPayloadHash = (metadata) => {
  const { integrity: _integrity, ...payload } = metadata;
  return keccak256(
    toHex(new TextEncoder().encode(JSON.stringify(sortValue(payload)))),
  );
};

const attestationMessage = ({ blueprintId, owner, metadataUri, payloadHash }) =>
  [
    'Tangle Blueprint Metadata Attestation',
    'schema: tangle-blueprint-metadata/v1',
    `blueprintId: ${blueprintId.toString()}`,
    `owner: ${owner.toLowerCase()}`,
    `metadataUri: ${metadataUri}`,
    `payloadHash: ${payloadHash}`,
  ].join('\n');

const hasMetadataImage = (metadata) =>
  Boolean(metadata.image || metadata.imageUrl || metadata.logo);

const generatedImageUri = (slug) =>
  `http://${PUBLIC_HOST}:${PUBLIC_PORT}/${slug}.svg`;

const withGeneratedImage = (slug, metadata) => {
  if (hasMetadataImage(metadata)) {
    return metadata;
  }

  return {
    ...metadata,
    image: generatedImageUri(slug),
  };
};

const hashSlug = (slug) =>
  Array.from(slug).reduce((hash, char) => {
    return (hash * 33 + char.charCodeAt(0)) % 360;
  }, 17);

const generatedBlueprintSvg = (slug, metadata) => {
  const hue = hashSlug(slug);
  const name = String(metadata.name ?? slug)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const initial = name.slice(0, 1).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="hsl(${(hue + 230) % 360} 48% 10%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 285) % 360} 54% 7%)"/>
    </linearGradient>
    <radialGradient id="hot" cx="25%" cy="22%" r="55%">
      <stop stop-color="hsl(${hue} 84% 62%)" stop-opacity=".55"/>
      <stop offset="1" stop-color="hsl(${hue} 84% 62%)" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cool" cx="76%" cy="20%" r="55%">
      <stop stop-color="hsl(${(hue + 74) % 360} 86% 56%)" stop-opacity=".45"/>
      <stop offset="1" stop-color="hsl(${(hue + 74) % 360} 86% 56%)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#hot)"/>
  <rect width="1200" height="630" fill="url(#cool)"/>
  <path d="M120 405 C320 120 520 520 760 205 S1010 230 1100 420" fill="none" stroke="white" stroke-opacity=".34" stroke-width="6"/>
  <path d="M150 270 C360 390 540 150 770 335 S1000 460 1110 250" fill="none" stroke="white" stroke-opacity=".18" stroke-width="5"/>
  <g fill="white" opacity=".8">
    <circle cx="250" cy="360" r="17"/><circle cx="515" cy="315" r="24"/><circle cx="760" cy="370" r="18"/><circle cx="990" cy="330" r="16"/>
  </g>
  <rect x="1010" y="460" width="110" height="110" rx="28" fill="black" fill-opacity=".22" stroke="white" stroke-opacity=".16"/>
  <text x="1065" y="535" text-anchor="middle" fill="white" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="64" font-weight="900">${initial}</text>
</svg>
`;
};

// Local dev ports for blueprint UIs. When BLUEPRINT_UI_USE_LOCAL_IFRAMES=true,
// the catalog rewrites `externalApp.url` for these slugs so iframes load from
// each blueprint's local dev server instead of the production CF deploy.
// Add an entry when a new blueprint gains a UI bundle with a `dev` script.
const LOCAL_IFRAME_DEV_URLS = {
  'ai-agent-sandbox': 'http://localhost:1338/',
  'ai-trading': 'http://localhost:1337/',
};

const useLocalIframes = process.env.BLUEPRINT_UI_USE_LOCAL_IFRAMES === 'true';

const applyLocalIframeOverride = (slug, metadata) => {
  if (!useLocalIframes) return metadata;
  const local = LOCAL_IFRAME_DEV_URLS[slug];
  const ext = metadata.blueprintUi?.externalApp;
  if (!local || !ext || ext.mode !== 'iframe') return metadata;
  return {
    ...metadata,
    blueprintUi: {
      ...metadata.blueprintUi,
      externalApp: { ...ext, url: local },
    },
  };
};

const loadCatalog = () =>
  BLUEPRINTS.flatMap(([slug, repoPath]) => {
    const sourcePath = resolve(repoPath, 'metadata/blueprint-metadata.json');
    if (!existsSync(sourcePath)) {
      console.warn(`skipping ${slug}: missing ${sourcePath}`);
      return [];
    }
    const sourceMetadata = JSON.parse(readFileSync(sourcePath, 'utf8'));
    const metadata = applyLocalIframeOverride(
      slug,
      withGeneratedImage(slug, sourceMetadata),
    );
    const metadataUri = `http://${PUBLIC_HOST}:${PUBLIC_PORT}/${slug}.json`;
    return {
      slug,
      repoPath,
      sourcePath,
      outputPath: resolve(GENERATED_DIR, `${slug}.json`),
      imageOutputPath: resolve(GENERATED_DIR, `${slug}.svg`),
      metadata,
      metadataUri,
      payloadHash: canonicalPayloadHash(metadata),
    };
  });

const prepare = () => {
  mkdirSync(GENERATED_DIR, { recursive: true });
  const catalog = loadCatalog();
  for (const item of catalog) {
    writeFileSync(
      item.outputPath,
      `${JSON.stringify(item.metadata, null, 2)}\n`,
    );
    if (item.metadata.image === generatedImageUri(item.slug)) {
      writeFileSync(
        item.imageOutputPath,
        generatedBlueprintSvg(item.slug, item.metadata),
      );
    }
  }
  writeFileSync(
    resolve(GENERATED_DIR, 'manifest.json'),
    `${JSON.stringify(
      catalog.map(
        ({
          slug,
          repoPath,
          sourcePath,
          outputPath,
          metadataUri,
          payloadHash,
          metadata,
        }) => ({
          slug,
          repoPath,
          sourcePath,
          outputPath,
          metadataUri,
          payloadHash,
          name: metadata.name,
        }),
      ),
      null,
      2,
    )}\n`,
  );
  console.log(
    `Prepared ${catalog.length} metadata documents in ${GENERATED_DIR}`,
  );
  return catalog;
};

const emptySource = (slug) => ({
  kind: 2,
  container: { registry: '', image: '', tag: '' },
  wasm: { runtime: 0, fetcher: 0, artifactUri: '', entrypoint: '' },
  native: {
    fetcher: 0,
    artifactUri: `file://${slug}`,
    entrypoint: `metadata/blueprint-metadata.json`,
  },
  testing: { cargoPackage: '', cargoBin: '', basePath: '' },
  binaries: [
    {
      arch: 5,
      os: 1,
      name: `${slug}-local-fixture`,
      sha256:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    },
  ],
});

const toJobDefinitions = (metadata) => {
  const actions = metadata.blueprintUi?.actions ?? [];
  const jobs = actions.slice(0, 8).map((action) => ({
    name: action.id ?? action.label,
    description: action.description ?? action.label,
    metadataUri: '',
    paramsSchema: '0x',
    resultSchema: '0x',
  }));
  return jobs.length > 0
    ? jobs
    : [
        {
          name: 'provision',
          description: 'Provision service',
          metadataUri: '',
          paramsSchema: '0x',
          resultSchema: '0x',
        },
      ];
};

const toDefinition = (item) => ({
  metadataUri: item.metadataUri,
  metadataHash: item.payloadHash,
  manager: zeroAddress,
  masterManagerRevision: 0,
  hasConfig: true,
  config: {
    membership: 1,
    pricing: 0,
    minOperators: 1,
    maxOperators: 0,
    subscriptionRate: 0n,
    subscriptionInterval: 0n,
    eventRate: 0n,
  },
  metadata: {
    name: item.metadata.name,
    description: item.metadata.description,
    author: item.metadata.author,
    category: item.metadata.category,
    codeRepository: item.metadata.codeRepository ?? '',
    logo: item.metadata.image ?? item.metadata.logo ?? '',
    website: item.metadata.website ?? '',
    license: item.metadata.license ?? 'MIT',
    profilingData: '',
  },
  jobs: toJobDefinitions(item.metadata),
  registrationSchema: '0x',
  requestSchema: '0x',
  sources: [emptySource(item.slug)],
  supportedMemberships: [1],
});

const waitForHash = async (publicClient, hash) => {
  console.log(`  tx: ${hash}`);
  return publicClient.waitForTransactionReceipt({ hash });
};

const getBlueprintLogs = async (publicClient) => {
  const logs = await publicClient.getLogs({
    address: TANGLE_ADDRESS,
    fromBlock: 0n,
    toBlock: 'latest',
  });
  return parseEventLogs({
    abi: tangleAbi,
    logs,
    eventName: 'BlueprintCreated',
    strict: false,
  });
};

const getServiceRequestLogs = async (publicClient) => {
  const logs = await publicClient.getLogs({
    address: TANGLE_ADDRESS,
    fromBlock: 0n,
    toBlock: 'latest',
  });
  return parseEventLogs({
    abi: tangleAbi,
    logs,
    eventName: 'ServiceRequested',
    strict: false,
  });
};

const getServiceActivatedLogs = async (publicClient) => {
  const logs = await publicClient.getLogs({
    address: TANGLE_ADDRESS,
    fromBlock: 0n,
    toBlock: 'latest',
  });
  return parseEventLogs({
    abi: tangleAbi,
    logs,
    eventName: 'ServiceActivated',
    strict: false,
  });
};

const signMetadata = async ({ item, blueprintId, ownerAccount }) => {
  const signature = await ownerAccount.signMessage({
    message: attestationMessage({
      blueprintId,
      owner: ownerAccount.address,
      metadataUri: item.metadataUri,
      payloadHash: item.payloadHash,
    }),
  });
  const signed = {
    ...item.metadata,
    integrity: {
      schema: 'tangle-blueprint-metadata/v1',
      signer: ownerAccount.address,
      signature,
      payloadHash: item.payloadHash,
      signedAt: new Date().toISOString(),
    },
  };
  writeFileSync(item.outputPath, `${JSON.stringify(signed, null, 2)}\n`);
};

// Idempotent: returns immediately if the operator is already active in
// staking. Otherwise approves OPERATOR_BOND TNT and registers with asset.
// We swallow duplicate-registration reverts so re-runs are safe.
const ensureOperatorActiveInStaking = async (
  operator,
  wallet,
  publicClient,
) => {
  const active = await publicClient.readContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'isOperatorActive',
    args: [operator.address],
  });
  if (active) return;

  try {
    const approveHash = await wallet.writeContract({
      address: TNT_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [STAKING_ADDRESS, OPERATOR_BOND],
    });
    await waitForHash(publicClient, approveHash);

    const registerHash = await wallet.writeContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: 'registerOperatorWithAsset',
      args: [TNT_TOKEN_ADDRESS, OPERATOR_BOND],
    });
    await waitForHash(publicClient, registerHash);
    console.log(
      `  + staking: ${operator.address} bonded ${OPERATOR_BOND / 10n ** 18n} TNT`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Often this fails benignly because the operator is already
    // registered with a different asset, or has insufficient balance.
    // Log + continue; the caller will see a clearer error from
    // registerOperator if the operator is genuinely unusable.
    console.warn(
      `  ! staking pre-reg skipped for ${operator.address}: ${message.split('\n')[0]}`,
    );
  }
};

const seed = async () => {
  const catalog = prepare();
  const deployer = privateKeyToAccount(DEPLOYER_KEY);
  const operators = OPERATOR_KEYS.map((key) => privateKeyToAccount(key));
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(RPC_URL),
  });
  const deployerClient = createWalletClient({
    account: deployer,
    chain: foundry,
    transport: http(RPC_URL),
  });

  try {
    await publicClient.getBlockNumber();
  } catch (error) {
    throw new Error(
      `Local Anvil RPC is not reachable at ${RPC_URL}. Start ./scripts/local-env/start-local-env.sh first.`,
      { cause: error },
    );
  }

  const createdLogs = await getBlueprintLogs(publicClient);
  const byHash = new Map(
    createdLogs.map((log) => [log.args.metadataHash.toLowerCase(), log]),
  );
  const serviceLogs = await getServiceRequestLogs(publicClient);
  const requestsByBlueprint = new Map(
    serviceLogs.map((log) => [log.args.blueprintId.toString(), log]),
  );
  const activatedLogs = await getServiceActivatedLogs(publicClient);
  const activatedByRequest = new Map(
    activatedLogs.map((log) => [log.args.requestId.toString(), log]),
  );
  const seeded = [];

  for (const item of catalog) {
    let created = byHash.get(item.payloadHash.toLowerCase());

    if (!created) {
      console.log(`Creating blueprint: ${item.metadata.name}`);
      const hash = await deployerClient.writeContract({
        address: TANGLE_ADDRESS,
        abi: tangleAbi,
        functionName: 'createBlueprint',
        args: [toDefinition(item)],
      });
      const receipt = await waitForHash(publicClient, hash);
      const logs = parseEventLogs({
        abi: tangleAbi,
        logs: receipt.logs,
        eventName: 'BlueprintCreated',
        strict: false,
      });
      created = logs[0];
      if (!created) {
        throw new Error(`Could not parse BlueprintCreated for ${item.slug}`);
      }
    } else {
      console.log(
        `Blueprint exists: ${item.metadata.name} #${created.args.blueprintId}`,
      );
    }

    const blueprintId = created.args.blueprintId;
    await signMetadata({ item, blueprintId, ownerAccount: deployer });

    if (created.args.metadataUri !== item.metadataUri) {
      console.log(`Updating metadata URI for ${item.slug} #${blueprintId}`);
      try {
        const hash = await deployerClient.writeContract({
          address: TANGLE_ADDRESS,
          abi: tangleAbi,
          functionName: 'updateBlueprint',
          args: [blueprintId, item.metadataUri, item.payloadHash],
        });
        await waitForHash(publicClient, hash);
      } catch (error) {
        console.warn(
          `Could not update metadata URI for ${item.slug}; metadata may be locked. Continuing with signed local fixture.`,
        );
      }
    }

    for (const [index, operator] of operators.entries()) {
      const registered = await publicClient.readContract({
        address: TANGLE_ADDRESS,
        abi: tangleAbi,
        functionName: 'isOperatorRegistered',
        args: [blueprintId, operator.address],
      });
      if (registered) continue;

      const wallet = createWalletClient({
        account: operator,
        chain: foundry,
        transport: http(RPC_URL),
      });

      // Operator must be active in the staking system before they can
      // register on a blueprint. LocalTestnet.s.sol only does this for
      // its bootstrap blueprint; do it here for every catalog blueprint
      // operator so registerOperator(blueprintId,…) succeeds.
      await ensureOperatorActiveInStaking(operator, wallet, publicClient);

      console.log(
        `Registering operator ${index + 1} for ${item.slug} #${blueprintId}`,
      );
      try {
        const hash = await wallet.writeContract({
          address: TANGLE_ADDRESS,
          abi: tangleAbi,
          functionName: 'registerOperator',
          args: [
            blueprintId,
            OPERATOR_GOSSIP_KEYS[index],
            `http://operator${index + 1}.local:8545`,
          ],
        });
        await waitForHash(publicClient, hash);
      } catch (err) {
        // Operator-not-active and similar prerequisite failures are
        // expected when the local stack hasn't fully wired the operator
        // into staking yet. We log and continue rather than aborting the
        // whole seed — blueprint creation is still valuable on its own.
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `  ! registerOperator skipped for ${item.slug} op${index + 1}: ${message.split('\n')[0]}`,
        );
      }
    }

    let requestId = requestsByBlueprint.get(blueprintId.toString())?.args
      .requestId;

    if (requestId === undefined) {
      console.log(
        `Requesting + approving service for ${item.slug} #${blueprintId}`,
      );
      try {
        const requestHash = await deployerClient.writeContract({
          address: TANGLE_ADDRESS,
          abi: tangleAbi,
          functionName: 'requestService',
          args: [
            blueprintId,
            [operators[0].address],
            '0x',
            [],
            0n,
            zeroAddress,
            0n,
            0,
          ],
          value: 0n,
        });
        const requestReceipt = await waitForHash(publicClient, requestHash);
        const requestLogs = parseEventLogs({
          abi: tangleAbi,
          logs: requestReceipt.logs,
          eventName: 'ServiceRequested',
          strict: false,
        });
        requestId = requestLogs[0]?.args.requestId;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `  ! requestService skipped for ${item.slug}: ${message.split('\n')[0]}`,
        );
      }
    }

    if (
      requestId !== undefined &&
      !activatedByRequest.has(requestId.toString())
    ) {
      console.log(`Approving service request ${requestId} for ${item.slug}`);
      const operatorWallet = createWalletClient({
        account: operators[0],
        chain: foundry,
        transport: http(RPC_URL),
      });
      try {
        const approveHash = await operatorWallet.writeContract({
          address: TANGLE_ADDRESS,
          abi: tangleAbi,
          functionName: 'approveService',
          // Unified PR-119 ApprovalParams. Empty arrays opt out of
          // per-asset security commitments, BLS pubkey, and TEE
          // attestation profiles — all manifest-gated capabilities the
          // catalog fixture doesn't exercise.
          args: [
            {
              requestId,
              securityCommitments: [],
              blsPubkey: [0n, 0n, 0n, 0n],
              blsPopSignature: [0n, 0n],
              teeCommitments: [],
            },
          ],
        });
        await waitForHash(publicClient, approveHash);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `  ! approveService skipped for ${item.slug}: ${message.split('\n')[0]}`,
        );
      }
    }

    seeded.push({
      slug: item.slug,
      blueprintId: blueprintId.toString(),
      metadataUri: item.metadataUri,
      payloadHash: item.payloadHash,
    });
  }

  writeFileSync(
    resolve(GENERATED_DIR, 'seeded.json'),
    `${JSON.stringify({ tangle: TANGLE_ADDRESS, rpcUrl: RPC_URL, seeded }, null, 2)}\n`,
  );
  console.log(`Seeded ${seeded.length} Tier 2 blueprint UI fixtures.`);
};

const serve = ({ prepareFirst = true } = {}) => {
  if (prepareFirst && !existsSync(resolve(GENERATED_DIR, 'manifest.json'))) {
    prepare();
  }
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://${HOST}:${PORT}`);
    const pathname = url.pathname === '/' ? '/manifest.json' : url.pathname;
    const fileName = basename(pathname);
    const filePath = resolve(GENERATED_DIR, fileName);
    const isJson = fileName.endsWith('.json');
    const isSvg = fileName.endsWith('.svg');
    if (!filePath.startsWith(GENERATED_DIR) || (!isJson && !isSvg)) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    try {
      const body = readFileSync(filePath);
      response.writeHead(200, {
        'Content-Type': isSvg
          ? 'image/svg+xml; charset=utf-8'
          : 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('not found');
    }
  });
  server.listen(PORT, HOST, () => {
    console.log(`Serving blueprint UI metadata at http://${HOST}:${PORT}/`);
  });
};

// ─── Cloudflare Pages deploy for iframe blueprint apps ─────────────────
//
// For every blueprint whose metadata declares `externalApp.mode === 'iframe'`
// targeting a *.blueprint.tangle.tools|sh URL, build the UI bundle and
// deploy it as a Cloudflare Pages project (idempotent). Reuses the same
// per-repo `metadata/blueprint-metadata.json` convention as the rest of
// this catalog. Run from the dapp root so wrangler picks up the global
// CLOUDFLARE_API_TOKEN/ACCOUNT_ID env vars.
//
// We deploy on Pages rather than Workers Static Assets because the
// account API token in use is Pages+DNS scoped only — Workers Custom
// Domain attach requires Workers:Edit, which the current token lacks.
// To migrate to Workers later: mint a CF token with Workers Scripts:Edit
// + Workers Routes:Edit, swap deployBlueprintApp to use `wrangler deploy`
// with [assets] directory in a generated wrangler.toml.

const HEADERS_TEMPLATE = `/*
  Content-Security-Policy: frame-ancestors https://cloud.tangle.tools https://app.tangle.tools https://apps.tangle.tools
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), midi=(), serial=()
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Frame-Options: SAMEORIGIN

/index.html
  Cache-Control: no-store
`;

const REDIRECTS_TEMPLATE = '/*    /index.html    200\n';

// First UI subdir we find that has a buildable package.json. Convention,
// not config — keeps blueprint repos free of CF-specific knobs.
const UI_SUBDIRS = ['arena', 'ui', 'app', 'frontend', 'web'];
const PREFERRED_BUILD_CMDS = ['build', 'cloud:build'];

const findUiSubdir = (repoPath) => {
  for (const sub of UI_SUBDIRS) {
    const pkgPath = resolve(repoPath, sub, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (!pkg.scripts) continue;
    const script = PREFERRED_BUILD_CMDS.find((s) => pkg.scripts[s]);
    if (script) {
      return {
        subdir: sub,
        packageManager: pkg.packageManager?.split('@')[0] ?? 'pnpm',
        script,
      };
    }
  }
  return null;
};

// Conventional Vite / React-Router output paths in priority order.
const findDistPath = (cwd) => {
  for (const candidate of ['build/client', 'dist', 'build']) {
    if (existsSync(resolve(cwd, candidate, 'index.html'))) return candidate;
  }
  return null;
};

const cfApi = async (path, init = {}) => {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) {
    throw new Error(
      'CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID env vars required',
    );
  }
  const url = path.startsWith('/zones')
    ? `https://api.cloudflare.com/client/v4${path}`
    : `https://api.cloudflare.com/client/v4/accounts/${account}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  return res.json();
};

const upsertCname = async (zoneId, hostname, target) => {
  const list = await cfApi(`/zones/${zoneId}/dns_records?name=${hostname}`);
  const sub = hostname.replace(/\.tangle\.tools$|\.tangle\.sh$/, '');
  if ((list.result ?? []).length === 0) {
    return cfApi(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'CNAME',
        name: sub,
        content: target,
        proxied: true,
        comment: 'iframe blueprint app',
      }),
    });
  }
  const record = list.result[0];
  if (record.content === target && record.type === 'CNAME') {
    return { success: true, noop: true };
  }
  return cfApi(`/zones/${zoneId}/dns_records/${record.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ type: 'CNAME', content: target, proxied: true }),
  });
};

const ensurePagesProject = async (slug) => {
  const existing = await cfApi(`/pages/projects/${slug}`);
  if (existing.success) return existing.result;
  const created = await cfApi(`/pages/projects`, {
    method: 'POST',
    body: JSON.stringify({ name: slug, production_branch: 'main' }),
  });
  if (!created.success) {
    throw new Error(
      `Failed to create Pages project ${slug}: ${JSON.stringify(created.errors)}`,
    );
  }
  return created.result;
};

const ensurePagesCustomDomain = async (slug, hostname) => {
  const list = await cfApi(`/pages/projects/${slug}/domains`);
  if ((list.result ?? []).some((d) => d.name === hostname)) return;
  await cfApi(`/pages/projects/${slug}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: hostname }),
  });
};

const deployBlueprintApp = async ({ slug, hostname, repoPath, build }) => {
  const cwd = resolve(repoPath, build.subdir);
  console.log(`\n── ${slug} — building ${cwd}`);
  execSync(`${build.packageManager} run ${build.script}`, {
    cwd,
    stdio: 'inherit',
  });

  const distRel = findDistPath(cwd);
  if (!distRel) {
    throw new Error(
      `${slug}: no built dist (looked for build/client, dist, build)`,
    );
  }
  const distAbs = resolve(cwd, distRel);

  writeFileSync(resolve(distAbs, '_headers'), HEADERS_TEMPLATE);
  writeFileSync(resolve(distAbs, '_redirects'), REDIRECTS_TEMPLATE);

  await ensurePagesProject(slug);

  console.log(`── ${slug} — wrangler pages deploy`);
  execFileSync(
    'wrangler',
    [
      'pages',
      'deploy',
      distAbs,
      `--project-name=${slug}`,
      '--branch=main',
      '--commit-dirty=true',
    ],
    { cwd, stdio: 'inherit' },
  );

  await ensurePagesCustomDomain(slug, hostname);

  // CF Pages auto-suffixes the *.pages.dev slug if taken (e.g. agent-sandbox
  // → agent-sandbox-5xi.pages.dev). Read the project's actual canonical
  // subdomain back so the CNAME points at a real target.
  const project = await cfApi(`/pages/projects/${slug}`);
  const canonical = project.result.subdomain;

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (zoneId) {
    await upsertCname(zoneId, hostname, canonical);
  } else {
    console.warn(
      `${slug}: CLOUDFLARE_ZONE_ID not set — skipping CNAME upsert (point ${hostname} at ${canonical} manually)`,
    );
  }

  console.log(`✓ ${slug} → https://${hostname}/   (CF: ${canonical})`);
};

const deployBlueprintApps = async (filterSlugs) => {
  const catalog = loadCatalog();
  const targets = catalog
    .map((item) => {
      const ext = item.metadata?.blueprintUi?.externalApp;
      if (!ext || ext.mode !== 'iframe') return null;
      let host;
      try {
        host = new URL(ext.url).hostname;
      } catch {
        return null;
      }
      if (!/\.blueprint\.tangle\.(tools|sh)$/.test(host)) return null;
      const slug = host.split('.')[0];
      if (filterSlugs.length > 0 && !filterSlugs.includes(slug)) return null;
      const build = findUiSubdir(item.repoPath);
      if (!build) {
        console.warn(
          `skipping ${slug}: no UI subdir with build script in ${item.repoPath}`,
        );
        return null;
      }
      return { slug, hostname: host, repoPath: item.repoPath, build };
    })
    .filter(Boolean);

  if (targets.length === 0) {
    console.log('No blueprints to deploy. Filter or metadata mismatch?');
    return;
  }
  for (const t of targets) {
    await deployBlueprintApp(t);
  }
  console.log(`\nDeployed ${targets.length} blueprint app(s).`);
};

const help = () => {
  console.log(`Usage: node scripts/local-env/blueprint-ui-catalog.mjs <command>

Commands:
  prepare    Copy repo metadata into the local generated catalog
  seed       Register local blueprints, operators, one service, and signed metadata
  serve      Serve generated metadata with CORS for tangle-cloud local dev
  up         Run seed, then serve
  deploy-cf  Deploy iframe blueprint apps to Cloudflare (Workers Static Assets)
             Optional: deploy-cf <slug>...   Restrict to specific apps

Run after ./scripts/local-env/start-local-env.sh has deployed local contracts.
Open tangle-cloud against Localhost 8545 and http://localhost:8080/v1/graphql.

deploy-cf requires CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID.`);
};

try {
  if (command === 'prepare') {
    prepare();
  } else if (command === 'seed') {
    await seed();
  } else if (command === 'serve') {
    serve();
  } else if (command === 'up') {
    await seed();
    serve({ prepareFirst: false });
  } else if (command === 'deploy-cf') {
    await deployBlueprintApps(process.argv.slice(3));
  } else {
    help();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
