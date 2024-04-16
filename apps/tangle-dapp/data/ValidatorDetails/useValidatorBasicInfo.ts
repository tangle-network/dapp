'use client';

import { useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { getPolkadotApiPromise } from '../../utils/polkadot/api';
import {
  extractDataFromIdentityInfo,
  IdentityDataType,
} from '../../utils/polkadot/identity';
import useRestakingProfile from '../restaking/useRestakingProfile';
import useCurrentEra from '../staking/useCurrentEra';

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
            if (twitterName === null) {
              setTwitter(twitterName);
            } else {
              // Convert twitter user name to corresponding href
              // Example: @tangle_network -> https://twitter.com/tangle_network
              const twitterHref = `https://twitter.com/${twitterName.substring(
                1
              )}`;
              setTwitter(twitterHref);
            }
          }
        }
      };

      const fetchNominations = async () => {
        if (
          currentEra !== null &&
          api.query.staking?.erasStakersOverview !== undefined
        ) {
          const erasStakersOverviewData =
            await api.query.staking.erasStakersOverview(
              currentEra,
              validatorAddress
            );
          if (erasStakersOverviewData.isSome) {
            const nominatorCount =
              erasStakersOverviewData.unwrap().nominatorCount;
            setNominations(nominatorCount.toNumber());
          }
        } else {
          setNominations(0);
        }
      };

      await Promise.all([fetchNameAndSocials(), fetchNominations()]);
    };

    fetchData();
  }, [validatorAddress, rpcEndpoint, currentEra]);

  return {
    name,
    isActive: true,
    totalRestaked,
    restakingMethod: profileTypeOpt,
    nominations,
    twitter,
    email,
    web,
  };
}
