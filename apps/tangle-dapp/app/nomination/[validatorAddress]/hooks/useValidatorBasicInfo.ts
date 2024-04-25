'use client';

import { useEffect, useState } from 'react';

import useNetworkStore from '../../../../context/useNetworkStore';
import useRestakingProfile from '../../../../data/restaking/useRestakingProfile';
import useCurrentEra from '../../../../data/staking/useCurrentEra';
import { getPolkadotApiPromise } from '../../../../utils/polkadot/api';
import {
  extractDataFromIdentityInfo,
  IdentityDataType,
} from '../../../../utils/polkadot/identity';

export default function useValidatorBasicInfo(validatorAddress: string) {
  const { rpcEndpoint } = useNetworkStore();
  const { data: currentEra } = useCurrentEra();
  const { profileTypeOpt, totalRestaked } =
    useRestakingProfile(validatorAddress);

  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [web, setWeb] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const [nominations, setNominations] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const api = await getPolkadotApiPromise(rpcEndpoint);
      const fetchNameAndSocials = async () => {
        const identityData = await api.query.identity.identityOf(
          validatorAddress
        );

        if (identityData.isSome) {
          const identity = identityData.unwrap();
          const info = identity[0]?.info;
          if (info) {
            setName(extractDataFromIdentityInfo(info, IdentityDataType.NAME));
            setEmail(extractDataFromIdentityInfo(info, IdentityDataType.EMAIL));
            setWeb(extractDataFromIdentityInfo(info, IdentityDataType.WEB));
            const twitterName = extractDataFromIdentityInfo(
              info,
              IdentityDataType.TWITTER
            );
            setTwitter(
              twitterName === null
                ? null
                : `https://twitter.com/${twitterName.substring(1)}`
            );
          }
        }
      };

      const fetchNominations = async () => {
        if (currentEra === null || !api.query.staking?.erasStakersOverview) {
          setNominations(null);
          setIsActive(null);
          return;
        }

        const erasStakersOverviewData =
          await api.query.staking.erasStakersOverview(
            currentEra,
            validatorAddress
          );
        if (erasStakersOverviewData.isSome) {
          const nominatorCount =
            erasStakersOverviewData.unwrap().nominatorCount;
          setNominations(nominatorCount.toNumber());
          setIsActive(true);
          return;
        }

        setNominations(null);
        setIsActive(false);
      };

      await Promise.all([fetchNameAndSocials(), fetchNominations()]);
      setIsLoading(false);
    };

    fetchData();
  }, [validatorAddress, rpcEndpoint, currentEra]);

  return {
    name,
    isActive,
    totalRestaked,
    restakingMethod: profileTypeOpt,
    nominations,
    twitter,
    email,
    web,
    isLoading,
  };
}
