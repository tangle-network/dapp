import { MixerContext, MixerContextData } from '@webb-dapp/react-environment';
import { useCall } from '@webb-dapp/react-hooks/useCall';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { GroupId } from '@webb-tools/types/interfaces';
import { useContext, useEffect, useMemo, useState } from 'react';
import { LoggerService } from '@webb-tools/app-util';

/**
 * @name useMixer
 * @description get Mixer context value
 */
export const useMixerProvider = (): MixerContextData => {
  return useContext<MixerContextData>(MixerContext);
};

export const useMixerGroups = (): MixerAssetGroup[] => {
  const mixerGroupIds = useCall<Array<GroupId>>('query.mixer.mixerGroupIds', []);

  return useMemo(() => {
    return (
      mixerGroupIds?.map((id) => {
        return new MixerAssetGroup(Number(id.toString()), 'EDG', 32);
      }) ?? []
    );
  }, [mixerGroupIds]);
};

type MixerResults = {
  initialized: boolean;
  loading: boolean;
  mixer: Mixer | null;
  shouldDestroy: false;
};

const logger = LoggerService.new('MixerUsage');

export const useMixer = () => {
  const mixerProvider = useMixerProvider();
  const mixerAssetGroup = useMixerGroups();
  const [mixerResult, setMixerResult] = useState<MixerResults>({
    initialized: false,
    loading: false,
    mixer: null,
    shouldDestroy: false,
  });

  useEffect(() => {
    let aborted = false;
    let _mixer: Mixer | null;

    const handleInit = async () => {
      setMixerResult((p) => ({
        ...p,
        loading: true,
      }));

      try {
        const mixer = await mixerProvider.init(mixerAssetGroup);

        _mixer = mixer;

        logger.trace(`Generated new mixer`);
        logger.debug(`Generated Mixer `, mixer);

        if (aborted) {
          logger.warn(`New mixer creation aborted`);

          return;
        }

        setMixerResult((p) => ({
          ...p,
          loading: false,
          mixer,
        }));
      } catch (e) {
        logger.error(`Mixer creation error`, e);
      } finally {
        setMixerResult((p) => ({
          ...p,
          loading: false,
        }));
      }
    };

    handleInit();

    return () => {
      aborted = true;

      if (_mixer) {
        logger.info(`Destroy the mixer`);
        _mixer.destroy();
      }
    };
  }, []);

  return {
    ...mixerResult,
  };
};
