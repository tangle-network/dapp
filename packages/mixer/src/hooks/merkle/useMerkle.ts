import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';
import { LoggerService } from '@webb-tools/app-util';
import MerkleTree from '@webb-tools/sdk-merkle/tree';
import { useCallback, useContext, useState } from 'react';

// @ts-ignore
import Worker from '../../utils/merkle.worker';
import { MerkleContext, MerkleContextData } from '@webb-dapp/mixer/containers';

/**
 * @name useMerkleProvider
 * @description get MerkleTree context value
 */
export const useMerkleProvider = (): MerkleContextData => {
  return useContext<MerkleContextData>(MerkleContext);
};

const logger = LoggerService.new('MerkleUsage');

export const useMerkle = ({ depth = 32 }: { depth: number }) => {
  const [merkleResult, setMerkleResult] = useState<Omit<MerkleContextData, 'init'>>({
    generatingBP: false,
    initialized: false,
    loading: false,
    merkle: null,
    restart(): Promise<void> {
      return Promise.resolve(undefined);
    },
    restarting: false,
    shouldDestroy: false,
  });
  const [bulletproofGens, setBulletproofGens] = useLocalStorage('bulletproof_gens');
  const generateBulletproof = useCallback(async () => {
    if (bulletproofGens) {
      logger.info(`Initializing merkletree with bulletproofs`);
      logger.info(`Encoding Bulletproof from localstorage string`);
      const encoder = new TextEncoder();
      const gens = encoder.encode(bulletproofGens);
      logger.info(`Encoded Bulletproof from localstorage string`);
      return gens;
    } else {
      logger.info(`Generating Bulletproof`);
    }
    const worker = new Worker();
    setMerkleResult((p) => ({
      ...p,
      generatingBP: true,
    }));
    logger.trace(`Generating Bulletproof`);
    const pBG = await MerkleTree.preGenerateBulletproofGens(worker).finally(() => {
      setMerkleResult((p) => ({
        ...p,
        generatingBP: true,
      }));
    });
    logger.trace(`Generated Bulletproof`);
    worker.terminate();
    logger.trace(`Decoding Bulletproof`);
    const decoder = new TextDecoder();
    const pBGString = decoder.decode(pBG); // from Uint8Array to String
    logger.trace(`Storing Bulletproof to localstorage`);
    setBulletproofGens(pBGString);
    return pBG;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulletproofGens]);
  const [called, setCalled] = useState(false);
  const init = useCallback(async () => {
    setCalled(true);

    if (called || merkleResult.initialized) {
      logger.error(`MerkleTree already initialized`);

      return undefined;
    }

    logger.info(`Generating new MerkleTree`);
    setMerkleResult((p) => ({
      ...p,
      loading: true,
    }));

    try {
      let gens = await generateBulletproof();
      logger.trace(`Bulletproof `, gens.length);
      const merkle = await MerkleTree.create(new Worker(), depth, gens);
      logger.info(`Generated new MerkleTree`);
      logger.debug(`Generated MerkleTree `, merkle);

      setMerkleResult((p) => ({
        ...p,
        initialized: true,
        loading: false,
        merkle,
      }));
    } catch (e) {
      logger.error(`Merkle creation error`, e);
    } finally {
      setCalled(false);
      setMerkleResult((p) => ({
        ...p,
        loading: false,
      }));
    }
  }, [merkleResult, called, setCalled, generateBulletproof, depth]);

  const restart = useCallback(async () => {
    if (!merkleResult.merkle) {
      logger.error(`Attempt to restart the MerkleTree before initializing`);
      return;
    }
    if (merkleResult.restarting) {
      logger.error(`Attempt to restart the MerkleTree while it's already restating`);
      return;
    }
    logger.info(`Restarting Wasm Merkle`);
    setMerkleResult((p) => ({
      ...p,
      initialized: false,
      restarting: true,
    }));
    await merkleResult.merkle.restart(new Worker());
    setMerkleResult((p) => ({
      ...p,
      initialized: true,
      restarting: false,
    }));
    logger.info(`Restarted Wasm Merkle`);
  }, [merkleResult.merkle, merkleResult.restarting]);

  return {
    init,
    ...merkleResult,
    restart,
  };
};
