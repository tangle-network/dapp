import { useAccounts, useCall, useMerkleProvider, useMixerInfo } from '@webb-dapp/react-hooks';
import { useGroupTree } from '@webb-dapp/react-hooks/merkle';
import { useTX } from '@webb-dapp/react-hooks/tx/useTX';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-mixer';
import { Block } from '@webb-tools/types/interfaces';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { InjectedAccount } from '@polkadot/extension-inject/types';
import { decodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

const logger = LoggerService.get('Withdraw');

export enum WithdrawState {
  Canceled,
  Ideal,
  GeneratingZk,
  SendingTransaction,
  Done,
  Faild,
}

export type WithdrawTXInfo = {
  account: InjectedAccount;
  note: Note;
};

export function useWithdraw(noteStr: string) {
  const { init, initialized, merkle, restart, restarting } = useMerkleProvider();

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const blockNumber = useCall<Block>('query.system.number', []);
  const cancel = useRef(false);
  const note = useMemo(() => {
    try {
      return noteStr ? Note.deserialize(noteStr) : undefined;
    } catch (e) {
      return undefined;
    }
  }, [noteStr]);

  const [withdrawTo, _setWithdrawTo] = useState<InjectedAccount | null>(null);
  const [stage, _setStage] = useState(WithdrawState.Ideal);

  const noteMixerGroupId = useMemo(() => note?.id, [note]);
  const groupTreeWrapper = useGroupTree(noteMixerGroupId?.toString());
  const mixerInfoWrapper = useMixerInfo(noteMixerGroupId?.toString());

  const withdrawTxInfo = useMemo<WithdrawTXInfo | null>(() => {
    if (!note || !withdrawTo) {
      return null;
    }
    return {
      account: withdrawTo,
      note,
    };
  }, [withdrawTo, note]);

  const [validationErrors, setValidationError] = useState({
    note: ``,
    withdrawTo: ``,
  });

  useEffect(() => {
    setValidationError((prev) => ({
      ...prev,
      note: note ? '' : `Please make sure to enter a valid note`,
      withdrawTo: withdrawTo ? '' : 'Invalid recipient',
    }));
  }, [withdrawTo, note]);

  const accounts = useAccounts();

  const cancelWithdraw = useCallback(async () => {
    if (stage < WithdrawState.SendingTransaction) {
      logger.info(`Canceling the withdraw ZK`);
      cancel.current = true;
      await restart();
      _setStage(WithdrawState.Canceled);
    }
  }, [stage, restart]);

  useEffect(() => {
    setWithdrawTo(accounts.active || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.active?.address]);

  const setWithdrawTo = useCallback((next: InjectedAccount | null) => {
    _setWithdrawTo(next);
  }, []);

  const setNextStageWithThresholdToIdeal = useCallback((success: boolean) => {
    _setStage(success ? WithdrawState.Done : WithdrawState.Faild);
    setTimeout(() => {
      _setStage(WithdrawState.Ideal);
    }, 10000);
  }, []);

  const { executeTX, loading } = useTX({
    method: 'withdraw',
    onExtrinsicSuccess: () => setNextStageWithThresholdToIdeal(true),
    onFailed: () => setNextStageWithThresholdToIdeal(false),
    params: [],
    section: 'mixer',
  });

  const canCancel = useMemo(() => {
    return stage < WithdrawState.SendingTransaction && stage > WithdrawState.Ideal && !restarting;
  }, [stage, restarting]);

  const canWithdraw = useMemo(() => {
    const validState = stage < WithdrawState.GeneratingZk;
    return groupTreeWrapper.ready && mixerInfoWrapper.ready && Boolean(note) && initialized && validState;
  }, [groupTreeWrapper, mixerInfoWrapper, note, initialized, stage]);
  const withdraw = async () => {
    const root = groupTreeWrapper.rootHashU8a;
    if (!root || !note) {
      logger.error(`Root has Error`);
      return;
    }
    if (!merkle) {
      logger.error(`MerkleTree isn't initialized`);
      return;
    }
    if (!groupTreeWrapper.ready || !mixerInfoWrapper.ready) {
      logger.error(`Groups aren't ready`);
      return;
    }
    if (!withdrawTo) {
      logger.error(`withdrawTo isn't ready`);
      return;
    }
    const leaves = mixerInfoWrapper.leaveU8a;
    await merkle.addLeaves(leaves);
    /* Generating Withdraw proof*/
    _setStage(WithdrawState.GeneratingZk);
    const zk = await merkle.generateZKProof({
      note: noteStr,
      recipient: decodeAddress(withdrawTo.address),
      relayer: decodeAddress(withdrawTo.address),
      root,
    });

    /* Generating Withdraw proof*/

    const withdrawProof = {
      cached_block: blockNumber,
      cached_root: root,
      comms: zk.commitments,
      leaf_index_commitments: zk.leafIndexCommitments,
      mixer_id: noteMixerGroupId,
      nullifier_hash: zk.nullifierHash,
      proof_bytes: u8aToHex(zk.proof),
      proof_commitments: zk.proofCommitments,
      recipient: withdrawTo?.address,
      relayer: withdrawTo?.address,
    };
    if (!cancel.current) {
      _setStage(WithdrawState.SendingTransaction);
      await executeTX([withdrawProof]);
    } else {
      logger.info(`TX cancel`);
    }
  };
  return {
    accounts: accounts.accounts || [],
    canCancel,
    canWithdraw,
    cancelWithdraw,
    loading,
    setWithdrawTo,
    stage,
    validationErrors,
    withdraw,
    withdrawTo,
    withdrawTxInfo,
  };
}
