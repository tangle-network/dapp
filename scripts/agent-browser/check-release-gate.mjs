#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const DEFAULT_CRITICAL_FLOW_IDS = [
  'FLOW-001',
  'FLOW-002',
  'FLOW-005',
  'FLOW-010',
  'FLOW-011',
  'FLOW-013',
  'FLOW-014',
  'FLOW-018',
  'FLOW-019',
];

const parsePositiveInteger = (value, label) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer. Received: ${value}`);
  }
  return parsed;
};

const parseFlowList = (value, fallback) => {
  if (value === undefined) {
    return [...fallback];
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === '' || normalized === 'none' || normalized === 'off') {
    return [];
  }

  return [...new Set(String(value).split(/[,\s]+/).map((entry) => entry.trim()))]
    .filter(Boolean)
    .map((entry) => entry.toUpperCase());
};

const findLatestReleaseMatrix = (rootDir) => {
  const agentResultsDir = path.join(rootDir, 'agent-results');
  if (!fs.existsSync(agentResultsDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(agentResultsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      dir: path.join(agentResultsDir, entry.name),
      matrix: path.join(agentResultsDir, entry.name, 'suite', 'release-matrix.json'),
    }))
    .filter((entry) => fs.existsSync(entry.matrix))
    .map((entry) => ({
      ...entry,
      mtimeMs: fs.statSync(entry.matrix).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return candidates[0]?.matrix ?? null;
};

const argv = parseArgs({
  args: process.argv.slice(2),
  options: {
    matrix: { type: 'string' },
    'critical-flows': { type: 'string' },
    'max-failed': { type: 'string' },
    'max-blocker-partial': { type: 'string' },
    'allow-critical-blocker': { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
}).values;

if (argv.help) {
  console.log(`\
Usage:
  node scripts/agent-browser/check-release-gate.mjs [options]

Options:
  --matrix <path>                    Path to suite/release-matrix.json (defaults to latest under agent-results/)
  --critical-flows <csv>             Comma-separated critical flow IDs (default: ${DEFAULT_CRITICAL_FLOW_IDS.join(',')})
  --max-failed <n>                   Max allowed failed rows (default: 0)
  --max-blocker-partial <n>          Max allowed blocker-or-partial rows (default: unlimited)
  --allow-critical-blocker           Allow critical flows to pass as blocker-or-partial (default: false)
  -h, --help                         Show help
`);
  process.exit(0);
}

const rootDir = process.cwd();
const matrixPath = path.resolve(
  argv.matrix ?? findLatestReleaseMatrix(rootDir) ?? '',
);
if (!matrixPath || !fs.existsSync(matrixPath)) {
  throw new Error(
    'release-matrix.json not found. Provide --matrix or run wallet flow suite first.',
  );
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const rows = Array.isArray(matrix.rows) ? matrix.rows : [];
if (rows.length === 0) {
  throw new Error(`No rows found in release matrix: ${matrixPath}`);
}

const criticalFlows = new Set(
  parseFlowList(argv['critical-flows'], DEFAULT_CRITICAL_FLOW_IDS),
);
const maxFailed = parsePositiveInteger(argv['max-failed'] ?? '0', '--max-failed');
const maxBlockerPartial =
  argv['max-blocker-partial'] === undefined
    ? Number.POSITIVE_INFINITY
    : parsePositiveInteger(argv['max-blocker-partial'], '--max-blocker-partial');
const allowCriticalBlocker = Boolean(argv['allow-critical-blocker'] ?? false);

const failedRows = rows.filter((row) => row.classification === 'failed');
const blockerRows = rows.filter(
  (row) => row.classification === 'blocker-or-partial-pass',
);
const criticalRows = rows.filter((row) => criticalFlows.has(row.flowId));
const missingCriticalFlows = [...criticalFlows].filter(
  (flowId) => !criticalRows.some((row) => row.flowId === flowId),
);

const criticalViolations = allowCriticalBlocker
  ? []
  : criticalRows.filter((row) => row.classification !== 'happy-path-pass');

console.log('[release-gate] matrix:', matrixPath);
console.log(
  `[release-gate] summary: total=${rows.length} happy=${rows.filter((row) => row.classification === 'happy-path-pass').length} blocker=${blockerRows.length} failed=${failedRows.length}`,
);
console.log(
  `[release-gate] critical flows: ${[...criticalFlows].join(', ') || '(none)'}`,
);

const reasons = [];
if (failedRows.length > maxFailed) {
  reasons.push(
    `Failed rows ${failedRows.length} exceeded max-failed=${maxFailed}.`,
  );
}
if (blockerRows.length > maxBlockerPartial) {
  reasons.push(
    `Blocker-or-partial rows ${blockerRows.length} exceeded max-blocker-partial=${maxBlockerPartial}.`,
  );
}
if (missingCriticalFlows.length > 0) {
  reasons.push(
    `Missing critical flows in matrix: ${missingCriticalFlows.join(', ')}.`,
  );
}
if (criticalViolations.length > 0) {
  reasons.push(
    `Critical flows are not happy-path-pass: ${criticalViolations
      .map((row) => `${row.flowId}(${row.classification})`)
      .join(', ')}.`,
  );
}

if (reasons.length > 0) {
  console.error('[release-gate] FAILED');
  for (const reason of reasons) {
    console.error(`- ${reason}`);
  }
  process.exit(1);
}

console.log('[release-gate] PASSED');
