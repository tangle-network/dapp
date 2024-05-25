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
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { SocialChip, TangleCard } from '../../../components';
import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import useNetworkStore from '../../../context/useNetworkStore';
import useValidatorInfoCard from '../../../data/validatorDetails/useValidatorInfoCard';
import useFormatNativeTokenAmount from '../../../hooks/useFormatNativeTokenAmount';
import { ExplorerType } from '../../../types';
import ValueSkeleton from './ValueSkeleton';

interface InfoCardProps {
  validatorAddress: string;
  className?: string;
}

const InfoCard: FC<InfoCardProps> = ({
  validatorAddress,
  className,
}: InfoCardProps) => {
  const { network, rpcEndpoint } = useNetworkStore();
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

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
  } = useValidatorInfoCard(rpcEndpoint, validatorAddress);

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
                    ? formatNativeTokenAmount(totalRestaked)
                    : EMPTY_VALUE_PLACEHOLDER}
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
                {nominations ?? EMPTY_VALUE_PLACEHOLDER}
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

export default InfoCard;
