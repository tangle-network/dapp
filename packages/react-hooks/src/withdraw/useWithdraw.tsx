import { useCall, useMixerGroups, useMixerProvider } from '@webb-dapp/react-hooks';
import { useMerkleGroups } from '@webb-dapp/react-hooks/merkle';
import { useTX } from '@webb-dapp/react-hooks/tx/useTX';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-mixer';
import { Block } from '@webb-tools/types/interfaces';
import { useEffect, useMemo } from 'react';

const logger = LoggerService.get('Withdraw');

export function useWithdraw(noteStr: string) {
  const { init, mixer } = useMixerProvider();

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const blockNumber = useCall<Block>('query.system.number', []);

  const note = useMemo(() => {
    try {
      return noteStr ? Note.deserialize(noteStr) : undefined;
    } catch (e) {
      return undefined;
    }
  }, [noteStr]);

  const noteMixerGroupId = useMemo(() => note?.id, [note]);
  const merkleGroups = useMerkleGroups(noteMixerGroupId?.toString());
  const mixerGroups = useMixerGroups(noteMixerGroupId?.toString());

  const { executeTX, loading } = useTX({
    method: 'withdraw',
    onExtrinsicSuccess: () => {},
    params: [],
    section: 'mixer',
  });

  const withdraw = async () => {
    const root = merkleGroups.rootHashU8a;
    if (!root || !note) {
      logger.error(`Root has Error`);
      return;
    }
    if (!mixer) {
      logger.error(`Mixer isn't initialized`);
      return;
    }
    if (!merkleGroups.ready || !mixerGroups.ready) {
      logger.error(`Groups aren't ready`);
    }
    const leaves = mixerGroups.leaveU8a;
    await mixer.withdraw(note, root, leaves, async (zkProof) => {
      logger.debug(`got zkProof `, zkProof);
      const { commitments, leafIndexCommitments, nullifierHash, proof, proofCommitments } = zkProof;
      const callParams = [
        0,
        blockNumber,
        root,
        commitments,
        nullifierHash,
        proof,
        leafIndexCommitments,
        proofCommitments,
      ];
      logger.debug(`Call parameters for withdraw`, callParams);
      await executeTX(callParams);
      logger.info(`Withdraw done`);
    });
  };
  return {
    loading,
    withdraw,
  };
}
