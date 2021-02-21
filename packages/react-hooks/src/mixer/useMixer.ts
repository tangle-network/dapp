import { MixerContext, MixerContextData } from '@webb-dapp/react-environment';
import { useCall } from '@webb-dapp/react-hooks/useCall';
import { LoggerService } from '@webb-tools/app-util';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { GroupId } from '@webb-tools/types/interfaces';
import { useCallback, useContext, useMemo, useState } from 'react';

// @ts-ignore
import Worker from './mixer.worker';

/**
 * @name useMixer
 * @description get Mixer context value
 */
export const useMixerProvider = (): MixerContextData => {
  return useContext<MixerContextData>(MixerContext);
};

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

export const useMixerInfos = (): any[] => {
  const mixerGroups = useCall<Array<any>>('query.mixer.mixerGroups.entries', [], undefined, []);

  return useMemo(() => {
    return (
      mixerGroups?.map((mixerInfo) => {
        return {
          key: mixerInfo[0],
          tree: mixerInfo[1],
        };
      }) ?? []
    );
  }, [mixerGroups]);
};

const logger = LoggerService.new('MixerUsage');

export const useMixer = () => {
  const mixerAssetGroup = useMixerGroups();
  const mixerInfo = useMixerInfos();

  const [mixerResult, setMixerResult] = useState<Omit<MixerContextData, 'init'>>({
    initialized: false,
    loading: false,
    mixer: null,
    shouldDestroy: false,
  });

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
      const mixer = await Mixer.init(new Worker(), mixerAssetGroup);

      logger.info(`Generated new mixer`);
      logger.debug(`Generated Mixer `, mixer);

      setMixerResult((p) => ({
        ...p,
        loading: false,
        initialized: true,
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
  }, [mixerAssetGroup, mixerResult]);
  return {
    ...mixerResult,
    init,
  };
};
