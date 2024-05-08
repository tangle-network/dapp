'use client';

import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  ExternalLinkIcon,
  Typography,
} from '@webb-tools/webb-ui-components';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { FC, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { SocialChip, TangleCard } from '../../../components';
import useNetworkStore from '../../../context/useNetworkStore';
import useRestakingRoleLedger from '../../../data/restaking/useRestakingRoleLedger';
import useCurrentEra from '../../../data/staking/useCurrentEra';
import { ExplorerType } from '../../../types';
import {
  extractDataFromIdentityInfo,
  formatTokenBalance,
  IdentityDataType,
} from '../../../utils/polkadot';
import { getApiPromise } from '../../../utils/polkadot/api';
import {
  getProfileTypeFromRestakeRoleLedger,
  getTotalRestakedFromRestakeRoleLedger,
} from '../../../utils/polkadot/restake';
import ValueSkeleton from './ValueSkeleton';

interface ValidatorBasicInfoCardProps {
  validatorAddress: string;
  className?: string;
}

const ValidatorBasicInfoCard: FC<ValidatorBasicInfoCardProps> = ({
  validatorAddress,
  className,
}: ValidatorBasicInfoCardProps) => {
  const { network, nativeTokenSymbol, rpcEndpoint } = useNetworkStore();

  const {
    name,
    isActive,
    totalRestaked,
    restakingMethod,
    nominations,
    twitter,
    email,
    web,
    isLoading,
  } = useValidatorBasicInfo(rpcEndpoint, validatorAddress);

  return (
    <TangleCard className={twMerge('min-h-[300px]', className)}>
      <div className="w-full space-y-9">
        <div className="flex gap-2">
          <Avatar
            sourceVariant="address"
            value={validatorAddress}
            theme="substrate"
            size="lg"
            className="w-9 h-9"
          />

          {/* Name && Active/Waiting */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <ValueSkeleton />
              ) : (
                <Typography variant="h4" fw="bold">
                  {name ?? shortenString(validatorAddress)}
                </Typography>
              )}
              {isActive !== null && !isLoading && (
                <Chip color={isActive ? 'green' : 'yellow'}>
                  {isActive ? 'Active' : 'Waiting'}
                </Chip>
              )}
            </div>

            {/* Address */}
            <div className="flex items-center gap-1">
              <Typography
                variant="h5"
                className="!text-mono-100"
              >{`Address: ${shortenString(validatorAddress, 7)}`}</Typography>

              <CopyWithTooltip
                textToCopy={validatorAddress}
                isButton={false}
                iconClassName="!fill-mono-100"
              />

              <ExternalLinkIcon
                href={getExplorerURI(
                  network.polkadotExplorerUrl,
                  validatorAddress,
                  'address',
                  ExplorerType.Substrate
                ).toString()}
                className="!fill-mono-100"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-2">
          {/* Restaked */}
          <div className="flex-1 space-y-3">
            <Typography variant="h5" fw="bold" className="!text-mono-100">
              Total Restaked
            </Typography>
            <div className="flex gap-3 items-center">
              {isLoading ? (
                <ValueSkeleton />
              ) : (
                <Typography
                  variant="h4"
                  fw="bold"
                  className="whitespace-nowrap"
                >
                  {totalRestaked
                    ? formatTokenBalance(totalRestaked, nativeTokenSymbol)
                    : '--'}
                </Typography>
              )}
              {!isLoading && (
                <Chip color="dark-grey">{restakingMethod?.value ?? 'N/A'}</Chip>
              )}
            </div>
          </div>

          {/* Nominations */}
          <div className="flex-1 space-y-3">
            <Typography variant="h5" fw="bold" className="!text-mono-100">
              Nominations
            </Typography>
            {isLoading ? (
              <ValueSkeleton />
            ) : (
              <Typography variant="h4" fw="bold">
                {nominations ?? '--'}
              </Typography>
            )}
          </div>
        </div>

        {/* Socials & Location */}
        <div className="flex gap-2 min-h-[30px]">
          <div className="flex-1 flex gap-2 items-center">
            {twitter && <SocialChip type="twitter" href={twitter} />}
            {email && <SocialChip type="email" href={`mailto:${email}`} />}
            {web && <SocialChip type="web" href={web} />}
          </div>
          {/* TODO: get location later */}
        </div>
      </div>
    </TangleCard>
  );
};

export default ValidatorBasicInfoCard;

function useValidatorBasicInfo(rpcEndpoint: string, validatorAddress: string) {
  const { result: currentEra } = useCurrentEra();
  const { result: ledgerOpt, isLoading: isLoadingLedgerOpt } =
    useRestakingRoleLedger(validatorAddress);

  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [web, setWeb] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const [nominations, setNominations] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restakingMethod = useMemo(
    () => getProfileTypeFromRestakeRoleLedger(ledgerOpt),
    [ledgerOpt]
  );

  const totalRestaked = useMemo(
    () => getTotalRestakedFromRestakeRoleLedger(ledgerOpt),
    [ledgerOpt]
  );

  useEffect(() => {
    const fetchData = async () => {
      const api = await getApiPromise(rpcEndpoint);

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
    restakingMethod,
    nominations,
    twitter,
    email,
    web,
    isLoading: isLoading || isLoadingLedgerOpt,
  };
}
