'use client';

import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useCallback, useEffect, useMemo, useState } from 'react';

import useRestakingRoleLedger from '../../data/restaking/useRestakingRoleLedger';
import useCurrentEra from '../../data/staking/useCurrentEra';
import usePolkadotApi, { PolkadotApiFetcher } from '../../hooks/usePolkadotApi';
import { getAccountInfo } from '../../utils/polkadot';
import {
  getProfileTypeFromRestakeRoleLedger,
  getTotalRestakedFromRestakeRoleLedger,
} from '../../utils/polkadot/restake';

export default function useValidatorInfoCard(
  rpcEndpoint: string,
  validatorAddress: string
) {
  const { notificationApi } = useWebbUI();
  const { data: currentEra } = useCurrentEra();
  const { data: ledgerOpt, isLoading: isLoadingLedgerOpt } =
    useRestakingRoleLedger(validatorAddress);

  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [web, setWeb] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const [isLoadingNameAndSocials, setIsLoadingNameAndSocials] = useState(true);

  const nominationsFetcher = useCallback<
    PolkadotApiFetcher<{
      nominations: number | null;
      isActive: boolean | null;
    }>
  >(
    async (api) => {
      if (currentEra === null || !api.query.staking?.erasStakersOverview) {
        return Promise.resolve({
          nominations: null,
          isActive: null,
        });
      }
      const erasStakersOverviewData =
        await api.query.staking.erasStakersOverview(
          currentEra,
          validatorAddress
        );
      if (erasStakersOverviewData.isSome) {
        const nominatorCount = erasStakersOverviewData.unwrap().nominatorCount;
        return {
          nominations: nominatorCount.toNumber(),
          isActive: true,
        };
      }
      return {
        nominations: null,
        isActive: false,
      };
    },
    [validatorAddress, currentEra]
  );

  const {
    value: nominationsData,
    isValueLoading: isLoadingNominations,
    error: errorNominations,
  } = usePolkadotApi(nominationsFetcher);

  const restakingMethod = useMemo(
    () => getProfileTypeFromRestakeRoleLedger(ledgerOpt),
    [ledgerOpt]
  );

  const totalRestaked = useMemo(
    () => getTotalRestakedFromRestakeRoleLedger(ledgerOpt),
    [ledgerOpt]
  );

  useEffect(() => {
    const fetchNameAndSocials = async () => {
      try {
        const validatorAccountInfo = await getAccountInfo(
          rpcEndpoint,
          validatorAddress
        );
        if (validatorAccountInfo) {
          setName(validatorAccountInfo.name);
          setEmail(validatorAccountInfo.email);
          setWeb(validatorAccountInfo.web);
          setTwitter(validatorAccountInfo.twitter);
        }
      } catch (error) {
        notificationApi({
          message: "Failed to load validators' name and socials",
          variant: 'error',
        });
      } finally {
        setIsLoadingNameAndSocials(false);
      }
    };

    fetchNameAndSocials();
  }, [validatorAddress, rpcEndpoint, currentEra, notificationApi]);

  useEffect(() => {
    if (errorNominations) {
      notificationApi({
        message: 'Failed to load nominations',
        variant: 'error',
      });
    }
  }, [errorNominations, notificationApi]);

  return {
    name,
    totalRestaked,
    restakingMethod,
    nominations: nominationsData?.nominations ?? null,
    isActive: nominationsData?.isActive ?? null,
    twitter,
    email,
    web,
    isLoading:
      isLoadingNameAndSocials || isLoadingNominations || isLoadingLedgerOpt,
  };
}
