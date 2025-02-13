import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  ExternalLinkIcon,
  Typography,
} from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import ValidatorSocials from '../../../components/ValidatorSocials';
import useValidatorInfoCard from '../../../data/validatorDetails/useValidatorInfoCard';
import ValueSkeleton from './ValueSkeleton';
import { CardWithTangleLogo } from '../../../components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

interface InfoCardProps {
  validatorAddress: SubstrateAddress;
  className?: string;
}

const InfoCard: FC<InfoCardProps> = ({
  validatorAddress,
  className,
}: InfoCardProps) => {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);

  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network.createExplorerAccountUrl,
  );

  const { name, isActive, nominations, twitter, email, web, isLoading } =
    useValidatorInfoCard(rpcEndpoint, validatorAddress);

  const accountAddressUrl = createExplorerAccountUrl(validatorAddress);

  return (
    <CardWithTangleLogo className={twMerge('min-h-[300px]', className)}>
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

              {accountAddressUrl !== null && (
                <ExternalLinkIcon
                  href={accountAddressUrl}
                  className="!fill-mono-100"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:gap-2">
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
        <ValidatorSocials
          twitterUrl={twitter ?? ''}
          email={email ?? ''}
          webUrl={web ?? ''}
          // TODO: get location later
          location={undefined}
        />
      </div>
    </CardWithTangleLogo>
  );
};

export default InfoCard;
