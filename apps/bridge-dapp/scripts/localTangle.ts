/**
 * Copyright 2023 Webb Technologies Inc.
 * SPDX-License-Identifier: Apache-2.0
 *
 * This script is used to start a local tangle network and create a pool share asset
 * for the bridge dapp to use (mostly for testing purposes)
 *
 * Dependency:
 * - @webb-tools/tangle: https://github.com/webb-tools/tangle
 *   Please put the `tangle` repo in the same level as the `webb-dapp` repo
 *   and follow the instructions in the `tangle` repo to build the node binary
 *   and then run this script.
 *
 * Options:
 * -v --verbose: Enable node logging
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from 'bn.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { resolve } from 'path';

import addAssetMetadata from './utils/addAssetMetadata';
import createPoolShare from './utils/createPoolShare';
import createVAnchor from './utils/createVAnchor';
import getLocalApi from './utils/getLocalApi';
import getKeyring from './utils/getKeyRing';
import transferAsset from './utils/transferAsset';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const shelljs = require('shelljs');

const ALICE_PORT = 9944;

const TANGLE_SUDO_URI = '//Alice';

const BOB_URI = '//Bob';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'tTNT';

const FUNGIBLE_ASSET = 'webbtTNT';

const TEST_ACCOUNT = process.env.POLKADOT_TEST_ACCOUNT_ADDRESS;

const AMOUNT = 1000;

const localStandaloneTangleScript = resolve(
  workspaceRoot,
  '../tangle/scripts/run-standalone.sh'
);

// Define CLI options
const program = new Command();

program.option('-v --verbose', 'Enable node logging');

program.parse(process.argv);

const options = program.opts();

async function main() {
  // Start the nodes
  console.log(chalk.blue('Starting local tangle network...'));

  const proc = shelljs.exec(localStandaloneTangleScript + ' --clean', {
    cwd: resolve(localStandaloneTangleScript, '../../'),
    async: true,
    silent: true,
  });
  cleanup(() => proc.kill('SIGINT'));

  if (options.verbose) {
    console.log(chalk.inverse(' - Verbose mode enabled'));
    proc.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
    });
    proc.stderr.on('data', (data: Buffer) => {
      console.error(data.toString());
    });
  }

  // Wait until we are ready and connected
  console.log(chalk.blue('Waiting for API to be ready...'));

  const aliceApi = await getLocalApi(ALICE_PORT);

  console.log(chalk`=> {green.bold API is ready!}`);

  // Wait until the first block is produced
  console.log(chalk`{blue Waiting for first block to be produced...}`);

  aliceApi.rpc.chain.subscribeNewHeads(async (header) => {
    const block = header.number.toNumber();
    // Init pool share after first block
    if (block === 1) {
      console.log(chalk`=> {green.bold First block produced!}`);
      await initPoolShare(aliceApi);
    }
  });

  // Return the unresolved promise to keep the script running
  return new Promise(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring(TANGLE_SUDO_URI);
  const bobKey = getKeyring(BOB_URI);

  // Create pool share asset
  console.log(chalk`[+] {blue Creating pool share asset ${FUNGIBLE_ASSET}...}`);
  const poolShareAssetId = await createPoolShare(
    api,
    FUNGIBLE_ASSET,
    +NATIVE_ASSET_ID,
    sudoKey
  );
  console.log(
    chalk`  => {green Pool share asset ${FUNGIBLE_ASSET} created with id ${poolShareAssetId}}`
  );

  // Add assets metadata
  console.log(chalk`[+] {blue Adding metadata for ${NATIVE_ASSET}...}`);
  await addAssetMetadata(api, sudoKey, NATIVE_ASSET_ID, NATIVE_ASSET);

  console.log(chalk`[+] {blue Adding metadata for ${FUNGIBLE_ASSET}...}`);
  await addAssetMetadata(
    api,
    sudoKey,
    poolShareAssetId.toString(),
    FUNGIBLE_ASSET
  );
  console.log(chalk`  => {green Assets metadata added}`);

  console.log(
    chalk`[+] {blue Creating VAnchor for asset ${FUNGIBLE_ASSET}...}`
  );

  const vanchorId = await createVAnchor(api, poolShareAssetId, sudoKey);

  console.log(chalk`  => {green VAnchor with id ${vanchorId} created}`);

  // Transfer some tokens to the test account
  if (TEST_ACCOUNT) {
    console.log(
      chalk`[+] {blue Transferring ${AMOUNT} ${NATIVE_ASSET} to test account...}`
    );
    const hash = await transferAsset(
      api,
      sudoKey,
      TEST_ACCOUNT,
      0,
      new BN(AMOUNT).mul(new BN(10).pow(new BN(18)))
    );

    console.log(
      chalk`  => {green Token transferred to test account with hash \`${hash}\`}`
    );
  }

  // Wrapping the token to initialize the fee recipient account
  console.log(
    chalk`[+] {blue Wrapping ${AMOUNT} ${NATIVE_ASSET} to initialize the fee recipient account...}`
  );
  const wrappingAmount = new BN(100).mul(new BN(10).pow(new BN(18)));

  const wrappingTx = await api.tx.tokenWrapper
    .wrap(NATIVE_ASSET_ID, poolShareAssetId, wrappingAmount, bobKey.address)
    .signAsync(bobKey);

  const wrappingHash = await new Promise<string>((resolve, reject) => {
    wrappingTx
      .send((result) => {
        if (result.isInBlock) {
          resolve(result.status.asInBlock.toString());
        } else if (result.isFinalized) {
          resolve(result.status.asFinalized.toString());
        } else if (result.isError) {
          reject(result);
        }
      })
      .catch(reject);
  });

  console.log(chalk`  => {green Token wrapped with hash \`${wrappingHash}\`}`);

  console.log(chalk.green.bold('✅ Tangle network ready to use!!!'));
}

function cleanup(callback?: () => any) {
  process.on('exit', function () {
    // Begin reading from stdin so the process does not exit imidiately
    process.stdin.resume();
    console.log(
      chalk.red.bold('exit event received, handling graceful shutdown...')
    );
    callback?.();
    process.exit(0);
  });

  process.on('SIGINT', function () {
    // Begin reading from stdin so the process does not exit imidiately
    process.stdin.resume();
    console.log(
      chalk.red.bold('SIGINT received, handling graceful shutdown...')
    );
    callback?.();
    process.exit(0);
  });

  process.on('uncaughtException', function (e) {
    // Begin reading from stdin so the process does not exit imidiately
    process.stdin.resume();
    console.log(
      chalk.red.bold('Uncaught Exception, handling graceful shutdown...')
    );
    console.log(e.stack);
    callback?.();
    process.exit(1);
  });
}

main().catch(console.error);
