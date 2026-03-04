const ensureTrailingSlash = (value) =>
  value.endsWith('/') ? value : `${value}/`;

const toUrl = (baseUrl, route) =>
  new URL(route.replace(/^\//, ''), ensureTrailingSlash(baseUrl)).toString();

const isVisible = async (page, selector) => {
  try {
    return await page.locator(selector).first().isVisible({ timeout: 1500 });
  } catch {
    return false;
  }
};

const anyVisible = async (page, selectors) => {
  for (const selector of selectors) {
    if (await isVisible(page, selector)) {
      return true;
    }
  }

  return false;
};

const TX_HISTORY_STORAGE_KEY = 'tx-history';
const TERMINAL_TX_STATUSES = new Set(['finalized', 'failed']);
const txBaselines = new Map();

const readTxStatusMap = async (page) =>
  page.evaluate((key) => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      const txs = parsed?.state?.transactions;

      if (!Array.isArray(txs)) {
        return {};
      }

      return Object.fromEntries(
        txs
          .filter(
            (tx) =>
              typeof tx?.hash === 'string' && typeof tx?.status === 'string',
          )
          .map((tx) => [tx.hash.toLowerCase(), tx.status]),
      );
    } catch {
      return {};
    }
  }, TX_HISTORY_STORAGE_KEY);

const makeTxBaselineSetup = (flowId, baselineUrl) => async (page) => {
  try {
    const currentUrl = page.url();
    const currentOrigin = currentUrl ? new URL(currentUrl).origin : undefined;
    const baselineOrigin = new URL(baselineUrl).origin;

    if (!currentOrigin || currentOrigin !== baselineOrigin) {
      await page.goto(baselineUrl, { waitUntil: 'domcontentloaded' });
    }
  } catch {
    // Fall through to best-effort baseline capture.
  }

  txBaselines.set(flowId, await readTxStatusMap(page));
};

const makeTxOutcomeCriterion = (flowId) => ({
  type: 'custom',
  description: 'A new transaction reached finalized/failed during this flow.',
  check: async (page) => {
    const before = txBaselines.get(flowId) ?? {};
    const after = await readTxStatusMap(page);

    return Object.entries(after).some(([hash, status]) => {
      const previousStatus = before[hash];
      return TERMINAL_TX_STATUSES.has(status) && previousStatus !== status;
    });
  },
});

const hasTerminalTxInHistory = async (page) => {
  const txStatuses = await readTxStatusMap(page);
  return Object.values(txStatuses).some((status) =>
    TERMINAL_TX_STATUSES.has(status),
  );
};

const buildFlowTags = (persona, app, extra = []) => {
  return [
    'launch-gate',
    'ready-manual-signoff',
    `persona:${persona}`,
    `app:${app}`,
    ...extra,
  ];
};

const flowPriority = (flowId) => Number(flowId.replace('FLOW-', ''));

export const createLaunchReadyManualSignoffCases = ({
  dappBaseUrl = 'http://localhost:4200',
  cloudBaseUrl = 'http://localhost:4300',
  blueprintId,
  serviceId,
} = {}) => {
  const deployRoute = blueprintId
    ? `/blueprints/${blueprintId}/deploy`
    : '/blueprints';

  const serviceRoute = serviceId ? `/services/${serviceId}` : '/instances';

  return [
    {
      id: 'FLOW-001',
      name: 'User staking deposit',
      description:
        'Validate staking deposit surface and drive a deposit tx up to wallet confirmation.',
      category: 'user',
      priority: flowPriority('FLOW-001'),
      tags: buildFlowTags('user', 'dapp', [
        'staking',
        'wallet-required',
        'tx-outcome',
      ]),
      startUrl: toUrl(dappBaseUrl, '/staking/deposit'),
      setup: makeTxBaselineSetup(
        'FLOW-001',
        toUrl(dappBaseUrl, '/staking/deposit'),
      ),
      goal: 'Open staking deposit. Select an asset, enter an amount, and progress until the transaction confirmation prompt is reached. If the wallet confirmation appears, submit it and wait for notifier/history status update.',
      successDescription:
        'Deposit flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        { type: 'url-contains', value: '/staking/deposit' },
        {
          type: 'custom',
          description: 'Deposit action controls are visible.',
          check: async (page) =>
            anyVisible(page, [
              'role=tab[name="Deposit"]',
              'button:has-text("Deposit")',
              'button:has-text("Approve & Deposit")',
              'button:has-text("Connect Wallet")',
              'text=/Deposited tokens successfully/i',
              'text=/Processing deposit/i',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-001'),
      ],
    },
    {
      id: 'FLOW-002',
      name: 'User staking delegate',
      description:
        'Validate delegate flow by selecting operator/asset and progressing to wallet confirmation.',
      category: 'user',
      priority: flowPriority('FLOW-002'),
      tags: buildFlowTags('user', 'dapp', [
        'staking',
        'wallet-required',
        'tx-outcome',
      ]),
      startUrl: toUrl(dappBaseUrl, '/staking/delegate'),
      setup: makeTxBaselineSetup(
        'FLOW-002',
        toUrl(dappBaseUrl, '/staking/delegate'),
      ),
      goal: 'Open staking delegate. Select an operator and asset, enter amount, and continue until delegate transaction confirmation is requested in wallet. Submit if wallet is ready.',
      successDescription:
        'Delegate flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        { type: 'url-contains', value: '/staking/delegate' },
        {
          type: 'custom',
          description: 'Delegate selection controls are visible.',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Select Operator")',
              'button:has-text("Select Asset")',
              'button:has-text("Delegate")',
              'button:has-text("Connect Wallet")',
              'button:has-text("Connect")',
              'button:has-text("Switch to supported chain")',
              'text=/No Operators Available/i',
              'text=/No Assets Available/i',
            ]),
        },
        {
          type: 'custom',
          description:
            'Delegate page shows either actionable controls or an explicit guard state.',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Delegate")',
              'button:has-text("Select Operator")',
              'button:has-text("Select Asset")',
              'text=/Not on whitelist/i',
              'text=/Operator not accepting delegations/i',
              'text=/No Operators Available/i',
              'text=/No Assets Available/i',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-002'),
      ],
    },
    {
      id: 'FLOW-003',
      name: 'User staking undelegate',
      description:
        'Validate schedule/execute undelegate surface and wallet-gated submission path.',
      category: 'user',
      priority: flowPriority('FLOW-003'),
      tags: buildFlowTags('user', 'dapp', [
        'staking',
        'wallet-required',
        'tx-outcome',
      ]),
      startUrl: toUrl(dappBaseUrl, '/staking/undelegate'),
      setup: makeTxBaselineSetup(
        'FLOW-003',
        toUrl(dappBaseUrl, '/staking/undelegate'),
      ),
      goal: 'Open staking undelegate. Choose a delegation, enter amount, schedule undelegate, and attempt execute-ready path when available. Submit tx if wallet confirmation appears.',
      successDescription:
        'Undelegate flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        { type: 'url-contains', value: '/staking/undelegate' },
        {
          type: 'custom',
          description: 'Undelegate controls are visible.',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Select Delegation")',
              'button:has-text("Schedule Undelegate")',
              'button:has-text("Execute Ready")',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-003'),
      ],
    },
    {
      id: 'FLOW-004',
      name: 'User staking withdraw',
      description:
        'Validate schedule/execute withdraw flow and wallet-gated submission path.',
      category: 'user',
      priority: flowPriority('FLOW-004'),
      tags: buildFlowTags('user', 'dapp', [
        'staking',
        'wallet-required',
        'tx-outcome',
      ]),
      startUrl: toUrl(dappBaseUrl, '/staking/withdraw'),
      setup: makeTxBaselineSetup(
        'FLOW-004',
        toUrl(dappBaseUrl, '/staking/withdraw'),
      ),
      goal: 'Open staking withdraw. Select asset, enter amount, schedule withdraw, and execute ready withdrawals when present. Submit tx if wallet confirmation appears.',
      successDescription:
        'Withdraw flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        { type: 'url-contains', value: '/staking/withdraw' },
        {
          type: 'custom',
          description: 'Withdraw controls are visible.',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Select Asset")',
              'button:has-text("Schedule Withdraw")',
              'button:has-text("Execute Ready")',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-004'),
      ],
    },
    {
      id: 'FLOW-005',
      name: 'User staking rewards claim',
      description:
        'Validate rewards claim surface and claim action state handling.',
      category: 'user',
      priority: flowPriority('FLOW-005'),
      tags: buildFlowTags('user', 'dapp', [
        'staking',
        'wallet-required',
        'tx-outcome',
      ]),
      startUrl: toUrl(dappBaseUrl, '/staking/rewards'),
      setup: makeTxBaselineSetup(
        'FLOW-005',
        toUrl(dappBaseUrl, '/staking/rewards'),
      ),
      goal: 'Open staking rewards, verify rewards surface loads, and attempt Claim All Rewards when available. Confirm wallet prompt or disabled/guarded state is explicit.',
      successDescription:
        'Rewards claim flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        { type: 'url-contains', value: '/staking/rewards' },
        {
          type: 'custom',
          description: 'Rewards action or wallet guidance is visible.',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Claim All Rewards")',
              'button:has-text("Claiming...")',
              'text=/Connect your wallet to view rewards/i',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-005'),
      ],
    },
    {
      id: 'FLOW-006',
      name: 'User staking route surface',
      description:
        'Validate canonical staking routes and verify native staking route is hidden from launch surface.',
      category: 'user',
      priority: flowPriority('FLOW-006'),
      tags: buildFlowTags('user', 'dapp', ['staking', 'route-surface']),
      startUrl: toUrl(dappBaseUrl, '/staking/deposit'),
      goal: 'Verify the canonical staking tabs/routes are exposed and that /staking/native is not a launch route.',
      successDescription:
        'Staking tabs are visible and /staking/native resolves to not-found.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Canonical staking surface is visible and /staking/native is not routed.',
          check: async (page) => {
            const hasSurface = await anyVisible(page, [
              'role=link[name="Stake"]',
              'role=tab[name="Deposit"]',
              'role=tab[name="Delegate"]',
            ]);

            const nativeUrl = toUrl(dappBaseUrl, '/staking/native');
            await page.goto(nativeUrl, { waitUntil: 'domcontentloaded' });
            const nativeHidden = await anyVisible(page, [
              'text=/Page Not Found/i',
            ]);

            await page.goto(toUrl(dappBaseUrl, '/staking/deposit'), {
              waitUntil: 'domcontentloaded',
            });

            return hasSurface && nativeHidden;
          },
        },
      ],
    },
    {
      id: 'FLOW-007',
      name: 'User migration claim submission',
      description:
        'Validate migration claim workflow surface through wallet/sign/proof/submit checkpoints.',
      category: 'user',
      priority: flowPriority('FLOW-007'),
      tags: buildFlowTags('user', 'dapp', [
        'migration',
        'wallet-required',
        'relayer-required',
        'tx-outcome',
      ]),
      startUrl: toUrl(dappBaseUrl, '/claim/migration'),
      setup: makeTxBaselineSetup(
        'FLOW-007',
        toUrl(dappBaseUrl, '/claim/migration'),
      ),
      goal: 'Open migration claim flow, connect wallets, set recipient, sign ownership proof, generate proof, and submit claim. If dependencies are unavailable, capture the explicit blocker message.',
      successDescription:
        'Migration claim flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        { type: 'url-contains', value: '/claim/migration' },
        {
          type: 'custom',
          description: 'Migration claim actions are visible.',
          check: async (page) =>
            anyVisible(page, [
              'role=heading[name="Claim your TNT!"]',
              'button:has-text("Connect EVM Wallet")',
              'button:has-text("Sign Ownership Proof")',
              'button:has-text("Generate ZK Proof")',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-007'),
      ],
    },
    {
      id: 'FLOW-009',
      name: 'Customer blueprint discovery/details',
      description:
        'Validate blueprint listing and details discovery flow in cloud app.',
      category: 'customer',
      priority: flowPriority('FLOW-009'),
      tags: buildFlowTags('customer', 'cloud', ['indexer']),
      startUrl: toUrl(cloudBaseUrl, '/blueprints'),
      goal: 'Open cloud blueprints page, inspect available blueprints, and open a blueprint details page when entries exist. Record explicit empty-state if none are indexed.',
      successDescription:
        'Blueprint discovery surface is loaded with either entries or explicit empty state.',
      successCriteria: [
        { type: 'url-contains', value: '/blueprints' },
        {
          type: 'custom',
          description: 'Blueprint listing heading or empty-state is visible.',
          check: async (page) =>
            anyVisible(page, [
              'role=heading[name="Available Blueprints"]',
              'text=/No blueprints found\\. Check back later or try a different network\\./i',
              'a[href^="/blueprints/"]',
            ]),
        },
      ],
    },
    {
      id: 'FLOW-010',
      name: 'Customer deploy blueprint request',
      description:
        'Validate deploy request wizard path and request argument input surfaces.',
      category: 'customer',
      priority: flowPriority('FLOW-010'),
      tags: buildFlowTags('customer', 'cloud', [
        'wallet-required',
        'indexer',
        'tx-outcome',
      ]),
      startUrl: toUrl(cloudBaseUrl, deployRoute),
      setup: makeTxBaselineSetup('FLOW-010', toUrl(cloudBaseUrl, deployRoute)),
      goal: 'Reach the deploy request flow for a blueprint. Complete basic information, operator selection, request mode, and payment sections; attempt deploy submission and capture tx state/error details.',
      successDescription:
        'Deploy request flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Deploy wizard is visible, or blueprints index is available for selection fallback.',
          check: async (page) =>
            anyVisible(page, [
              'text=/Basic Information/i',
              'text=/Select Operators/i',
              'text=/Request Mode/i',
              'button:has-text("Deploy")',
              'role=heading[name="Available Blueprints"]',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-010'),
      ],
    },
    {
      id: 'FLOW-011',
      name: 'Customer service ACL/funding/job',
      description:
        'Validate service details flow for ACL edits, funding modal, and job submission actions.',
      category: 'customer',
      priority: flowPriority('FLOW-011'),
      tags: buildFlowTags('customer', 'cloud', [
        'wallet-required',
        'indexer',
        'tx-outcome',
      ]),
      startUrl: toUrl(cloudBaseUrl, serviceRoute),
      setup: makeTxBaselineSetup('FLOW-011', toUrl(cloudBaseUrl, serviceRoute)),
      goal: 'Open a service details page, validate ACL section, fund service modal path, and submit job path. Attempt actions until wallet confirmation or explicit validation/error guards.',
      successDescription:
        'Service details actions yield a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Service details controls are visible, or instances table is available when direct service route is not supplied.',
          check: async (page) =>
            anyVisible(page, [
              'text=/Service Settings: Permitted Callers/i',
              'button:has-text("Add Caller")',
              'button:has-text("Fund Service")',
              'button:has-text("Submit Job")',
              'role=tab[name="Running"]',
              'role=tab[name="Joinable"]',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-011'),
      ],
    },
    {
      id: 'FLOW-012',
      name: 'Customer cloud tx history/notifier',
      description:
        'Validate cloud transaction drawer/notifier rendering and lifecycle visibility.',
      category: 'customer',
      priority: flowPriority('FLOW-012'),
      tags: buildFlowTags('customer', 'cloud', ['tx-history']),
      dependsOn: ['FLOW-010'],
      startUrl: toUrl(cloudBaseUrl, '/instances'),
      goal: 'Open cloud transaction history drawer and verify at least one terminal transaction lifecycle state is visible.',
      successDescription:
        'Transactions drawer is visible and contains at least one terminal transaction status.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Transactions UI is reachable and tx-history contains a terminal transaction.',
          check: async (page) => {
            const hasTransactionUi = await anyVisible(page, [
              'button:has-text("Transactions")',
              'role=heading[name="Transactions"]',
            ]);
            if (!hasTransactionUi) {
              return false;
            }

            return hasTerminalTxInHistory(page);
          },
        },
      ],
    },
    {
      id: 'FLOW-013',
      name: 'Operator pending request approve/reject',
      description:
        'Validate pending request review and approve/reject modal path.',
      category: 'operator',
      priority: flowPriority('FLOW-013'),
      tags: buildFlowTags('operator', 'cloud', [
        'wallet-required',
        'indexer',
        'tx-outcome',
      ]),
      startUrl: toUrl(cloudBaseUrl, '/instances'),
      setup: makeTxBaselineSetup('FLOW-013', toUrl(cloudBaseUrl, '/instances')),
      goal: 'Open pending requests tab, review a pending service request, and drive approve/reject action to wallet-confirmation stage while preserving visible tx/notifier traceability.',
      successDescription:
        'Pending request review flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        {
          type: 'custom',
          description: 'Pending requests tab and review controls are present.',
          check: async (page) =>
            anyVisible(page, [
              'role=tab[name="Pending"]',
              'button:has-text("Review")',
              'text=/Pending Request/i',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-013'),
      ],
    },
    {
      id: 'FLOW-014',
      name: 'Operator join/leave/exit lifecycle',
      description:
        'Validate operator membership actions and exit queue lifecycle controls.',
      category: 'operator',
      priority: flowPriority('FLOW-014'),
      tags: buildFlowTags('operator', 'cloud', [
        'wallet-required',
        'indexer',
        'tx-outcome',
      ]),
      startUrl: toUrl(cloudBaseUrl, serviceRoute),
      setup: makeTxBaselineSetup('FLOW-014', toUrl(cloudBaseUrl, serviceRoute)),
      goal: 'Open service details and validate operator membership lifecycle paths: join, leave, schedule exit, execute exit, and force-exit/terminate when available.',
      successDescription:
        'Operator membership lifecycle flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Operator membership controls are visible, or instances page fallback is available.',
          check: async (page) =>
            anyVisible(page, [
              'text=/Operator Membership/i',
              'button:has-text("Join Service")',
              'button:has-text("Leave Service")',
              'text=/Exit Queue/i',
              'button:has-text("Schedule Exit")',
              'button:has-text("Execute Exit")',
              'role=tab[name="Running"]',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-014'),
      ],
    },
    {
      id: 'FLOW-015',
      name: 'Operator stake deep-link from cloud to dapp',
      description:
        'Validate operators page Manage action deep-links into dapp staking delegate flow.',
      category: 'operator',
      priority: flowPriority('FLOW-015'),
      tags: buildFlowTags('operator', 'cloud', ['cross-app']),
      startUrl: toUrl(cloudBaseUrl, '/operators'),
      goal: 'From cloud operators page, trigger the Manage stake action and verify navigation to the dapp staking delegate route with operator context when available.',
      successDescription:
        'Manage stake action deep-links to the canonical dapp staking delegate route.',
      successCriteria: [
        {
          type: 'custom',
          description: 'Current URL is the dapp staking delegate route.',
          check: async (page) => {
            const currentUrl = page.url();
            if (!currentUrl.includes('/staking/delegate')) {
              return false;
            }

            try {
              return new URL(currentUrl).origin === new URL(dappBaseUrl).origin;
            } catch {
              return false;
            }
          },
        },
      ],
    },
    {
      id: 'FLOW-016',
      name: 'Operator tx lifecycle traceability',
      description:
        'Validate operator tx lifecycle traces stay consistent in notifier/drawer/modal surfaces.',
      category: 'operator',
      priority: flowPriority('FLOW-016'),
      tags: buildFlowTags('operator', 'cloud', ['tx-history']),
      dependsOn: ['FLOW-013'],
      startUrl: toUrl(cloudBaseUrl, '/instances'),
      goal: 'Trigger or observe an operator transaction, then confirm at least one terminal status is present and visible via tx UI channels.',
      successDescription:
        'Operator tx lifecycle channels are visible with at least one terminal transaction status.',
      successCriteria: [
        {
          type: 'custom',
          description: 'Operator tx UI is reachable and terminal tx exists.',
          check: async (page) => {
            const hasTransactionUi = await anyVisible(page, [
              'button:has-text("Transactions")',
              'text=/Processing /i',
              'text=/completed/i',
              'text=/failed/i',
            ]);
            if (!hasTransactionUi) {
              return false;
            }

            return hasTerminalTxInHistory(page);
          },
        },
      ],
    },
    {
      id: 'FLOW-017',
      name: 'Operator security requirements fail-closed path',
      description:
        'Validate security requirement read failures are surfaced with explicit fail-closed messaging.',
      category: 'operator',
      priority: flowPriority('FLOW-017'),
      tags: buildFlowTags('operator', 'cloud', ['wallet-required', 'indexer']),
      startUrl: toUrl(cloudBaseUrl, serviceRoute),
      goal: 'Open join-service or approval flow and verify security requirements are loaded. If read fails, confirm explicit fail-closed messaging and blocked unsafe submit behavior.',
      successDescription:
        'Security requirement section is visible or fail-closed message is shown.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Security requirements are loaded or explicit fail-closed contract-read error is shown.',
          check: async (page) =>
            anyVisible(page, [
              'text=/Security Commitment/i',
              'text=/Unable to load security requirements from the contract/i',
            ]),
        },
      ],
    },
    {
      id: 'FLOW-018',
      name: 'Developer blueprint registration/create/manage',
      description:
        'Validate blueprint registration drawer and create/manage routes.',
      category: 'developer',
      priority: flowPriority('FLOW-018'),
      tags: buildFlowTags('developer', 'cloud', [
        'wallet-required',
        'indexer',
        'tx-outcome',
      ]),
      startUrl: toUrl(cloudBaseUrl, '/blueprints'),
      setup: makeTxBaselineSetup(
        'FLOW-018',
        toUrl(cloudBaseUrl, '/blueprints'),
      ),
      goal: 'Validate developer blueprint workflows: registration drawer, create blueprint wizard, and manage blueprints operations. Attempt write actions up to wallet confirmation.',
      successDescription:
        'Developer blueprint flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Blueprint registration/create/manage controls are visible across routes.',
          check: async (page) => {
            const hasBlueprintControls = await anyVisible(page, [
              'button:has-text("Register")',
              'text=/Available Blueprints/i',
            ]);

            if (!hasBlueprintControls) {
              return false;
            }

            await page.goto(toUrl(cloudBaseUrl, '/blueprints/create'), {
              waitUntil: 'domcontentloaded',
            });
            const hasCreate = await anyVisible(page, [
              'text=/Create Blueprint/i',
              'button:has-text("Next")',
            ]);

            await page.goto(toUrl(cloudBaseUrl, '/blueprints/manage'), {
              waitUntil: 'domcontentloaded',
            });
            const hasManage = await anyVisible(page, [
              'text=/My Blueprints/i',
              'button:has-text("Update Metadata")',
              'text=/No Blueprints Yet/i',
            ]);

            return hasCreate && hasManage;
          },
        },
        makeTxOutcomeCriterion('FLOW-018'),
      ],
    },
    {
      id: 'FLOW-019',
      name: 'Developer operator batch register hook',
      description:
        'Validate operator batch registration path and tx lifecycle traceability.',
      category: 'developer',
      priority: flowPriority('FLOW-019'),
      tags: buildFlowTags('developer', 'cloud', [
        'wallet-required',
        'indexer',
        'tx-outcome',
      ]),
      startUrl: toUrl(cloudBaseUrl, '/blueprints'),
      setup: makeTxBaselineSetup(
        'FLOW-019',
        toUrl(cloudBaseUrl, '/blueprints'),
      ),
      goal: 'Open operator registration drawer for one or more blueprints, submit registration, and verify progress/success feedback and tx lifecycle traceability.',
      successDescription:
        'Operator batch registration flow yields a terminal transaction update (finalized/failed) from this run.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Registration CTA/drawer is present, with progress or completion feedback when submission occurs.',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Register")',
              'text=/Register as Operator/i',
              'text=/Step [0-9]+ of 3/i',
              'text=/Registered for [0-9]+ of [0-9]+ blueprints/i',
            ]),
        },
        makeTxOutcomeCriterion('FLOW-019'),
      ],
    },
  ];
};

export default createLaunchReadyManualSignoffCases;
