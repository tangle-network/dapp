import { useCall, useMixerProvider } from '@webb-dapp/react-hooks';
import { useEffect, useMemo } from 'react';
import { Note } from '@webb-tools/sdk-mixer';
import { LoggerService } from '@webb-tools/app-util';
import { BlockNumber, GroupTree, MixerInfo } from '@webb-tools/types/interfaces';
import { hexToU8a } from '@polkadot/util';
import { useTX } from '@webb-dapp/react-hooks/tx/useTX';

const logger = LoggerService.get('Withdraw');

export function useWithdraw(noteStr: string) {
  const { init, mixer } = useMixerProvider();

  const note = useMemo(() => {
    try {
      return noteStr ? Note.deserialize(noteStr) : undefined;
    } catch (e) {
      return undefined;
    }
  }, [noteStr]);
  // const mixerGroup = useCall<Array<any>>('query.mixer.mixerGroups', [0]);
  const groupTree = useCall<GroupTree>('query.merkle.groups', [0]);
  const blockNumber = useCall<BlockNumber>('derive.chain.getBlock', []);
  const rootHash = useMemo<string | undefined>(() => groupTree?.toHuman().root_hash as any, [groupTree]);
  const group = useCall<MixerInfo>('query.mixer.mixerGroups', [note?.id], undefined, undefined, () => Boolean(note));
  const { executeTX, loading } = useTX({
    method: 'withdraw',
    onExtrinsicSuccess: () => {},
    params: [],
    section: 'mixer',
  });
  useEffect(() => {
    init();
  }, []);

  const withdraw = async () => {
    if (!mixer || !group || !rootHash) {
      logger.warn(`Attempt to withdraw without mixer been initialized`, {
        mixer,
        group,
        rootHash,
        note,
      });
      return;
    }
    const leaf = await mixer.saveNote(note);
    const root = hexToU8a(rootHash);

    const leaves = group.leaves.map((type) => type.toU8a());
    await mixer.withdraw(note, root, leaves, async (zkProof) => {
      logger.debug(`zkProof `, zkProof);
      const { commitments, leafIndexCommitments, nullifierHash, proof, proofCommitments } = zkProof;
      const callParamters = [
        0,
        blockNumber,
        root,
        commitments,
        nullifierHash,
        proof,
        leafIndexCommitments,
        proofCommitments,
      ];
      await executeTX(callParamters);
    });
  };
  return {
    loading,
    withdraw,
  };
}
