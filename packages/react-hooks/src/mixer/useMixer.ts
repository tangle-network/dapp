import { MixerContext, MixerContextData } from '@webb-dapp/react-environment';
import { useCall } from '@webb-dapp/react-hooks/useCall';
import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';
import { LoggerService } from '@webb-tools/app-util';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { GroupId } from '@webb-tools/types/interfaces';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useMixerInfos } from '@webb-dapp/react-hooks/mixer/useMixerInfos';

// @ts-ignore
import Worker from './mixer.worker';

/**
 * @name useMixer
 * @description get Mixer context value
 */
export const useMixerProvider = (): MixerContextData => {
  return useContext<MixerContextData>(MixerContext);
};
export const mixerLogger = LoggerService.get('MixerContext');
export const useMixerGroups = (): MixerAssetGroup[] => {
  const mixerGroupIds = useCall<Array<GroupId>>('query.mixer.mixerGroupIds', [], undefined, []);

  return useMemo(() => {
    return (
      mixerGroupIds?.map((id) => {
        return new MixerAssetGroup(Number(id.toString()), 'EDG', 32);
      }) ?? []
    );
  }, [mixerGroupIds]);
};

const logger = LoggerService.new('MixerUsage');

export const useMixer = () => {
  const mixerIds = useMixerGroups();
  const mixerInfos = useMixerInfos();

  const [mixerResult, setMixerResult] = useState<Omit<MixerContextData, 'init'>>({
    generatingBP: false,
    initialized: false,
    loading: false,
    mixer: null,
    shouldDestroy: false,
  });
  const [bulletproofGens, setBulletproofGens] = useLocalStorage('bulletproof_gens');
  const generateBulletproof = useCallback(async () => {
    if (bulletproofGens) {
      logger.info(`Initializing mixer with bulletproofs`);
      logger.info(`Encoding Bulletproof from localstorage string`);
      const encoder = new TextEncoder();
      const gens = encoder.encode(bulletproofGens);
      logger.info(`Encoded Bulletproof from localstorage string`);
      return gens;
    } else {
      logger.info(`Generating Bulletproof`);
    }
    const worker = new Worker();
    setMixerResult((p) => ({
      ...p,
      generatingBP: true,
    }));
    logger.trace(`Generating Bulletproof`);
    const pBG = await Mixer.preGenerateBulletproofGens(worker).finally(() => {
      setMixerResult((p) => ({
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

    if (called || mixerResult.initialized) {
      logger.error(`Mixer already initialized`);

      return undefined;
    }

    logger.info(`Generating new mixer`);
    setMixerResult((p) => ({
      ...p,
      loading: true,
    }));

    try {
      let gens = await generateBulletproof();
      logger.trace(`Bulletproof `, gens.length);
      const mixer = await Mixer.init(new Worker(), mixerIds, gens);
      logger.info(`Generated new mixer`);
      logger.debug(`Generated Mixer `, mixer);

      setMixerResult((p) => ({
        ...p,
        initialized: true,
        loading: false,
        mixer,
      }));
    } catch (e) {
      logger.error(`Mixer creation error`, e);
    } finally {
      setCalled(false);
      setMixerResult((p) => ({
        ...p,
        loading: false,
      }));
    }
  }, [mixerIds, mixerResult, called, setCalled, generateBulletproof]);
  return {
    init,
    mixerIds,
    mixerInfos,
    ...mixerResult,
  };
};
