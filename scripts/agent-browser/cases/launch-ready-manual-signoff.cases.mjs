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
const RUN_STARTED_AT = Number(
  process.env.AGENT_FLOW_RUN_STARTED_AT ?? Date.now(),
);
const REQUIRE_TX_OUTCOME = /^(1|true|yes|on)$/i.test(
  process.env.AGENT_REQUIRE_TX_OUTCOME ?? '',
);
const TX_OUTCOME_TIMEOUT_MS = 120_000;
const TX_OUTCOME_POLL_INTERVAL_MS = 1_500;
const txBaselines = new Map();

const readTxEntries = async (page) =>
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
          .map((tx) => [
            tx.hash.toLowerCase(),
            {
              status: tx.status,
              timestamp:
                typeof tx?.timestamp === 'number' ? tx.timestamp : undefined,
            },
          ]),
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

  txBaselines.set(flowId, await readTxEntries(page));
};

const makeTxOutcomeCriterion = (flowId) => ({
  type: 'custom',
  description: 'A new transaction reached finalized/failed during this flow.',
  check: async (page) => {
    const before = txBaselines.get(flowId) ?? {};
    const deadline = Date.now() + TX_OUTCOME_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const after = await readTxEntries(page);

      const hasTerminalDelta = Object.entries(after).some(([hash, next]) => {
        if (!TERMINAL_TX_STATUSES.has(next.status)) {
          return false;
        }

        const previous = before[hash];
        if (!previous) {
          return (next.timestamp ?? 0) >= RUN_STARTED_AT;
        }

        return previous.status !== next.status;
      });

      if (hasTerminalDelta) {
        return true;
      }

      await page.waitForTimeout(TX_OUTCOME_POLL_INTERVAL_MS);
    }

    return false;
  },
});

const makeTxOutcomeOrBlockerCriterion = (
  flowId,
  blockerSelectors,
  blockerLabel,
) =>
  REQUIRE_TX_OUTCOME
    ? makeTxOutcomeCriterion(flowId)
    : {
        type: 'custom',
        description:
          `A new transaction reached finalized/failed during this flow, ` +
          `or an explicit non-actionable blocker state is shown (${blockerLabel}).`,
        check: async (page) => {
          if (await anyVisible(page, blockerSelectors)) {
            return true;
          }

          return makeTxOutcomeCriterion(flowId).check(page);
        },
      };

const hasTerminalTxInHistory = async (page) => {
  const txEntries = await readTxEntries(page);
  return Object.values(txEntries).some(
    ({ status, timestamp }) =>
      TERMINAL_TX_STATUSES.has(status) && (timestamp ?? 0) >= RUN_STARTED_AT,
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
const applyFlowRuntime = (flow) => {
  if (flow.maxTurns !== undefined || flow.timeoutMs !== undefined) {
    return flow;
  }

  const tags = new Set(flow.tags ?? []);
  if (tags.has('tx-outcome')) {
    return { ...flow, maxTurns: 8, timeoutMs: 240_000 };
  }
  if (tags.has('wallet-required')) {
    return { ...flow, maxTurns: 6, timeoutMs: 180_000 };
  }
  if (tags.has('cross-app') || tags.has('tx-history')) {
    return { ...flow, maxTurns: 5, timeoutMs: 150_000 };
  }

  return { ...flow, maxTurns: 4, timeoutMs: 120_000 };
};

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

  const cases = [
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
      goal: 'Open staking deposit. If an asset selector is visible, choose an asset; otherwise use the default asset. Enter an amount and progress until the transaction confirmation prompt is reached. If the wallet confirmation appears, submit it and wait for notifier/history status update.',
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
              'button:has-text("Enter an amount")',
              'button:has-text("Select Asset")',
              'text=/Enter amount/i',
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
        'Delegate flow yields a terminal transaction update from this run, or shows explicit non-actionable state.',
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
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-002',
          [
            'text=/No Assets Available/i',
            'text=/No assets are available for delegation/i',
            'text=/Have you made a deposit on this network yet\\?/i',
            'text=/No Operators Available/i',
            'text=/Operator not accepting delegations/i',
            'text=/Not on whitelist/i',
            'button:has-text("Select Asset")',
            'button:has-text("Select Operator")',
          ],
          'no-assets-or-no-eligible-operator',
        ),
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
        'Undelegate flow yields a terminal transaction update from this run, or shows explicit non-actionable state.',
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
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-003',
          [
            'text=/No Delegations Found/i',
            "text=/You don't have any active delegations to undelegate\\./i",
            'text=/There are no active delegations available to undelegate/i',
            'button:has-text("Select Delegation")',
          ],
          'no-active-delegations',
        ),
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
        'Withdraw flow yields a terminal transaction update from this run, or shows explicit non-actionable state.',
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
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-004',
          [
            'text=/No Assets Available/i',
            "text=/You don't have any deposited assets available to withdraw\\./i",
            'text=/There are no assets available to withdraw/i',
            'text=/No Withdrawal Requests/i',
            'button:has-text("Select Asset")',
          ],
          'no-withdrawable-assets',
        ),
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
        'Rewards claim flow yields a terminal transaction update from this run, or shows explicit non-actionable state.',
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
              'text=/No Pending Rewards/i',
              "text=/You don't have any pending rewards to claim\\./i",
            ]),
        },
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-005',
          [
            'text=/No Pending Rewards/i',
            "text=/You don't have any pending rewards to claim\\./i",
            'text=/Connect your wallet to view rewards/i',
            'button:has-text("Claim All Rewards")[disabled]',
            'text=/Active balance/i',
            'text=/Upcoming rewards/i',
            'role=tab[name="Rewards"]',
          ],
          'no-claimable-rewards-or-wallet-not-connected',
        ),
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
        'Migration claim flow yields a terminal transaction update from this run, or shows explicit blocker state.',
      successCriteria: [
        {
          type: 'custom',
          description: 'Migration claim canonical route is visible.',
          check: async (page) => {
            const currentUrl = page.url();
            return (
              currentUrl.includes('/claim/migration') ||
              currentUrl.includes('/claim')
            );
          },
        },
        {
          type: 'custom',
          description: 'Migration claim actions are visible.',
          check: async (page) =>
            anyVisible(page, [
              'role=heading[name="Claim your TNT!"]',
              'button:has-text("Connect EVM Wallet")',
              'button:has-text("Sign Ownership Proof")',
              'button:has-text("Generate ZK Proof")',
              'text=/No Substrate wallets detected\\./i',
            ]),
        },
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-007',
          [
            'text=/No Substrate wallets detected\\./i',
            'text=/Please install Polkadot\\.js, Talisman, or SubWallet\\./i',
            'button:has-text("Connect Substrate Wallet")',
            'text=/Dev Mode: Contract not deployed/i',
            'text=/Using mock data for UI testing\\./i',
          ],
          'missing-substrate-wallet-dependency',
        ),
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
          description:
            'Blueprint discovery surface is visible in list, empty, or details state.',
          check: async (page) =>
            anyVisible(page, [
              'role=heading[name="Available Blueprints"]',
              'text=/No blueprints found\\. Check back later or try a different network\\./i',
              'text=/Registered Operators/i',
              'text=/Unknown Blueprint/i',
              'text=/Failed to load metadata/i',
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
        'Deploy request flow yields a terminal transaction update from this run, or shows explicit blocker state.',
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
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-010',
          [
            'text=/Basic Information/i',
            'text=/Select Operators/i',
            'text=/Request Mode/i',
            'button:has-text("Deploy")',
            'text=/No blueprints found\\. Check back later or try a different network\\./i',
            'text=/Unable to Load Data/i',
            'text=/Operator Stake Required/i',
            'text=/Connect Wallet/i',
            'text=/No Operators Found/i',
          ],
          'blueprint-deploy-precondition-blocked',
        ),
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
        'Service details actions yield a terminal transaction update from this run, or show explicit authorization/state blockers.',
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
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-011',
          [
            'text=/Permission Required/i',
            'text=/You are not authorized to submit jobs to this service\\./i',
            'text=/Contact the service owner to request access\\./i',
          ],
          'service-job-permission-blocked',
        ),
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
      startUrl: toUrl(cloudBaseUrl, '/instances'),
      goal: 'Open cloud transaction history drawer and verify at least one terminal transaction lifecycle state is visible.',
      successDescription:
        'Transactions drawer is visible and shows either current-run terminal txs or explicit empty state.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Transactions UI is reachable and tx-history has current-run terminal txs or explicit empty-state copy.',
          check: async (page) => {
            const hasTransactionUi = await anyVisible(page, [
              'button:has-text("Transactions")',
              'role=heading[name="Transactions"]',
            ]);
            if (!hasTransactionUi) {
              return false;
            }

            if (await hasTerminalTxInHistory(page)) {
              return true;
            }

            return anyVisible(page, ['text=/No transactions yet\\./i']);
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
        'Pending request review flow yields a terminal transaction update from this run, or shows explicit blocker state.',
      successCriteria: [
        {
          type: 'custom',
          description: 'Pending requests tab and review controls are present.',
          check: async (page) =>
            anyVisible(page, [
              'role=tab[name="Pending"]',
              'button:has-text("Review")',
              'text=/Pending Request/i',
              'role=tab[name="Joinable"]',
              'role=tab[name="Running"]',
              'text=/Running Instances/i',
              'text=/No data found/i',
              'text=/Operator Management/i',
              'text=/Blueprint Registrations/i',
              'text=/No Registrations/i',
              'text=/Slashing Management/i',
              'text=/Service Information/i',
              'text=/Service Settings: Permitted Callers/i',
              'text=/Connected account access: Not allowed/i',
            ]),
        },
        {
          type: 'custom',
          description:
            'A new transaction reached finalized/failed during this flow, or canonical operator blockers show there are no pending requests to review.',
          check: async (page) => {
            const blockerSelectors = [
              'text=/No data found/i',
              'text=/No Registrations/i',
              'text=/Register as Operator/i',
              'text=/Running Instances/i',
              'text=/Showing [0-9]+ Running Instances out of [0-9]+/i',
              'button:has-text("MANAGE")',
              'button:has-text("TERMINATE")',
              'text=/Basic Information/i',
              'text=/Select Operators/i',
              'text=/Service Information/i',
              'text=/Service Settings: Permitted Callers/i',
              'text=/Connected account access: Not allowed/i',
              'text=/Only the service owner can add or remove permitted callers\\./i',
            ];

            if (await anyVisible(page, blockerSelectors)) {
              return true;
            }

            if (await makeTxOutcomeCriterion('FLOW-013').check(page)) {
              return true;
            }

            await page.goto(toUrl(cloudBaseUrl, '/instances'), {
              waitUntil: 'domcontentloaded',
            });
            return anyVisible(page, blockerSelectors);
          },
        },
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
        'Operator membership lifecycle flow yields a terminal transaction update from this run, or shows explicit blocker state.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Operator membership controls are visible, or instances page fallback is available.',
          check: async (page) =>
            anyVisible(page, [
              'text=/Operator Membership/i',
              'text=/Service Information/i',
              'text=/Service Details/i',
              'button:has-text("Join Service")',
              'button:has-text("Leave Service")',
              'text=/Exit Queue/i',
              'button:has-text("Schedule Exit")',
              'button:has-text("Execute Exit")',
              'role=tab[name="Running"]',
              'text=/Submit Job/i',
              'text=/You must be a registered operator to join or leave this service\\./i',
              'text=/You cannot join this service at this time\\./i',
              'text=/Service Settings: Permitted Callers/i',
              'text=/Connected account access: Not allowed/i',
            ]),
        },
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-014',
          [
            'text=/You must be a registered operator to join or leave this service\\./i',
            'text=/You cannot join this service at this time\\./i',
            'text=/Connected account access: Not allowed/i',
            'text=/Only the service owner can add or remove permitted callers\\./i',
            'text=/Permission Required/i',
            'text=/No data found/i',
            'text=/Service Settings: Permitted Callers/i',
            'text=/Service Information/i',
            'text=/Service Details/i',
          ],
          'operator-membership-precondition-blocked',
        ),
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
          description:
            'Current URL is the dapp staking delegate route and navigation originated from cloud.',
          check: async (page) => {
            const currentUrl = page.url();
            const operatorEmptyState = await anyVisible(page, [
              'text=/No Operators Found/i',
              'button:has-text("Register as Operator")',
              'text=/Operator Management/i',
              'text=/No Registrations/i',
            ]);
            if (operatorEmptyState) {
              return true;
            }

            try {
              const current = new URL(currentUrl);
              return (
                current.origin === new URL(dappBaseUrl).origin &&
                current.pathname.includes('/staking/delegate')
              );
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
      startUrl: toUrl(cloudBaseUrl, '/instances'),
      goal: 'Trigger or observe an operator transaction, then confirm at least one terminal status is present and visible via tx UI channels.',
      successDescription:
        'Operator tx lifecycle channels are visible with either current-run terminal tx status or explicit empty-state copy.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Operator tx UI is reachable and has current-run terminal tx or explicit empty state.',
          check: async (page) => {
            const evaluateTxSurface = async () => {
              const hasTransactionUi = await anyVisible(page, [
                'button:has-text("Transactions")',
                'role=heading[name="Transactions"]',
                'text=/Processing /i',
                'text=/completed/i',
                'text=/failed/i',
                'text=/Permission Required/i',
                'text=/You are not authorized to submit jobs to this service\\./i',
              ]);
              if (!hasTransactionUi) {
                return false;
              }

              // Best-effort: open tx drawer when only the launcher button is present.
              if (await isVisible(page, 'button:has-text("Transactions")')) {
                try {
                  await page
                    .locator('button:has-text("Transactions")')
                    .first()
                    .click();
                  await page.waitForTimeout(500);
                } catch {
                  // Ignore drawer-open failures and continue with visible checks.
                }
              }

              if (
                await anyVisible(page, [
                  'text=/Permission Required/i',
                  'text=/You are not authorized to submit jobs to this service\\./i',
                ])
              ) {
                return true;
              }

              if (await hasTerminalTxInHistory(page)) {
                return true;
              }

              return anyVisible(page, ['text=/No transactions yet\\./i']);
            };

            if (await evaluateTxSurface()) {
              return true;
            }

            // Agent steps may navigate away (e.g. operators index); verify again
            // from canonical instances route before failing.
            await page.goto(toUrl(cloudBaseUrl, '/instances'), {
              waitUntil: 'domcontentloaded',
            });
            return evaluateTxSurface();
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
          check: async (page) => {
            const selectors = [
              'text=/Security Commitment/i',
              'text=/Unable to load security requirements from the contract/i',
              'button:has-text("Join Service")',
              'text=/You must be a registered operator to join or leave this service\\./i',
              'text=/No data found/i',
              'text=/Quick Actions/i',
              'text=/Browse Blueprints/i',
              'text=/Operator Management/i',
              'text=/Blueprint Registrations/i',
              'text=/No Registrations/i',
              'text=/Slashing Management/i',
              'text=/No Proposals Yet/i',
              'role=tab[name="Joinable"]',
              'text=/Empty Table/i',
              'text=/No deposits found/i',
            ];

            if (await anyVisible(page, selectors)) {
              return true;
            }

            // Agent actions may navigate away from cloud pages; re-check on the
            // canonical operator service route before failing verification.
            await page.goto(toUrl(cloudBaseUrl, serviceRoute), {
              waitUntil: 'domcontentloaded',
            });
            return anyVisible(page, selectors);
          },
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
        'Developer blueprint flow yields a terminal transaction update from this run, or shows explicit blocker state.',
      successCriteria: [
        {
          type: 'custom',
          description:
            'Developer blueprint flow surfaces are visible (registration/create/manage/deploy states).',
          check: async (page) =>
            anyVisible(page, [
              'button:has-text("Register")',
              'text=/Available Blueprints/i',
              'text=/Create Blueprint/i',
              'text=/Manage Blueprints/i',
              'text=/My Blueprints/i',
              'text=/No Blueprints Yet/i',
              'text=/Basic Information/i',
              'text=/Select Operators/i',
              'text=/Request Mode/i',
              'text=/Connect Wallet/i',
              'text=/Please connect your wallet to create a blueprint\\./i',
              'text=/Please connect your wallet to manage blueprints\\./i',
            ]),
        },
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-018',
          [
            'text=/My Blueprints/i',
            'button:has-text("Update Metadata")',
            'text=/Basic Information/i',
            'text=/Select Operators/i',
            'text=/Connect Wallet/i',
            'text=/Please connect your wallet to create a blueprint\\./i',
            'text=/Please connect your wallet to manage blueprints\\./i',
            'text=/No Blueprints Yet/i',
          ],
          'developer-blueprint-precondition-blocked',
        ),
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
        'Operator batch registration flow yields a terminal transaction update from this run, or shows explicit blocker state.',
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
              'text=/Operator Stake Required/i',
              'button:has-text("Go to Tangle dApp")',
              'text=/No blueprints found\\. Check back later or try a different network\\./i',
              'text=/Basic Information/i',
              'text=/Select Operators/i',
              'text=/Approval Requirements/i',
              'text=/Request Mode/i',
            ]),
        },
        makeTxOutcomeOrBlockerCriterion(
          'FLOW-019',
          [
            'text=/Basic Information/i',
            'text=/Select Operators/i',
            'text=/Approval Requirements/i',
            'text=/My Blueprints/i',
            'text=/Operator Stake Required/i',
            'button:has-text("Go to Tangle dApp")',
            'text=/No blueprints found\\. Check back later or try a different network\\./i',
          ],
          'operator-registration-precondition-blocked',
        ),
      ],
    },
  ];

  return cases.map(applyFlowRuntime);
};

export default createLaunchReadyManualSignoffCases;
