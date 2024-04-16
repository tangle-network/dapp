'use client';

import { useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { getPolkadotApiPromise } from '../../utils/polkadot/api';
import {
  extractDataFromIdentityInfo,
  IdentityDataType,
} from '../../utils/polkadot/identity';

type ValidatorOverviewDataType = {
  identity?: string;
  isActive: boolean;
  totalRestaked: number;
  restakingMethod?: 'independent' | 'shared';
  nominations: number;
  twitter?: string;
  discord?: string;
  email?: string;
  web?: string;
  location?: string;
};

export default function useValidatorBasicInfo(validatorAddress: string) {
  const { rpcEndpoint } = useNetworkStore();

  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [web, setWeb] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const api = await getPolkadotApiPromise(rpcEndpoint);
      const identityData = await api.query.identity.identityOf(
        validatorAddress
      );

      if (identityData.isSome) {
        const identity = identityData.unwrapOrDefault();
        const info = identity[0].info;
        setName(extractDataFromIdentityInfo(info, IdentityDataType.NAME));
        setEmail(extractDataFromIdentityInfo(info, IdentityDataType.EMAIL));
        setWeb(extractDataFromIdentityInfo(info, IdentityDataType.WEB));
        setTwitter(extractDataFromIdentityInfo(info, IdentityDataType.TWITTER));
      }
    };

    fetchData();
  }, [validatorAddress, rpcEndpoint]);

  return {
    name,
    isActive: true,
    totalRestaked: 1000,
    restakingMethod: 'independent',
    nominations: 155,
    twitter,
    email,
    web,
  };
}
