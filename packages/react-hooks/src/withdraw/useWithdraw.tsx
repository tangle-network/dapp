import { useCall, useMixerInfo, useMixerProvider } from '@webb-dapp/react-hooks';
import { useGroupTree } from '@webb-dapp/react-hooks/merkle';
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
  const groupTreeWrapper = useGroupTree(noteMixerGroupId?.toString());
  const mixerInfoWrapper = useMixerInfo(noteMixerGroupId?.toString());

  const { executeTX, loading } = useTX({
    method: 'withdraw',
    onExtrinsicSuccess: () => {},
    params: [],
    section: 'mixer',
  });

  const withdraw = async () => {
    const root = groupTreeWrapper.rootHashU8a;
    if (!root || !note) {
      logger.error(`Root has Error`);
      return;
    }
    if (!mixer) {
      logger.error(`Mixer isn't initialized`);
      return;
    }
    if (!groupTreeWrapper.ready || !mixerInfoWrapper.ready) {
      logger.error(`Groups aren't ready`);
      return;
    }
    const leaves = mixerInfoWrapper.leaveU8a;
    const zk = await mixer.generateZK(note, root, leaves);
    const withdrawProof = {
      cached_block: blockNumber,
      cached_root: root,
      comms: zk.commitments,
      leaf_index_commitments: zk.leafIndexCommitments,
      mixer_id: noteMixerGroupId,
      nullifier_hash: zk.nullifierHash,
      proof_bytes: zk.proof,
      proof_commitments: zk.proofCommitments,
    };
    await executeTX([withdrawProof]);
  };
  return {
    loading,
    withdraw,
  };
}
