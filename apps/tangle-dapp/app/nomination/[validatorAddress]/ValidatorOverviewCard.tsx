import { MapPinLine } from '@webb-tools/icons';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { twMerge } from 'tailwind-merge';

import { SocialChip, TangleBigLogo } from '../../../components';
import getValidatorOverviewData from '../../../data/getValidatorOverviewData';
import TotalRestaked from './TotalRestaked';

interface ValidatorOverviewCardProps {
  validatorAddress: string;
  className?: string;
}

export default async function ValidatorOverviewCard({
  validatorAddress,
  className,
}: ValidatorOverviewCardProps) {
  const {
    identity,
    isActive,
    totalRestaked,
    restakingMethod,
    nominations,
    twitter,
    discord,
    email,
    web,
    location,
  } = await getValidatorOverviewData(validatorAddress);

  return (
    <div
      className={twMerge(
        'min-h-[300px] relative p-5 rounded-2xl overflow-hidden',
        'border border-mono-0 dark:border-mono-160',
        'flex items-center',
        'bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.30)_100%)]',
        'dark:bg-[linear-gradient(180deg,#2B2F40_0%,rgba(43,47,64,0.50)_100%)]',
        className
      )}
    >
      <div className="w-full space-y-9">
        <div className="flex gap-2">
          <Avatar
            sourceVariant="address"
            value={validatorAddress}
            theme="substrate"
            size="lg"
            className="w-9 h-9"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {identity && (
                <Typography variant="h4" fw="bold">
                  {identity}
                </Typography>
              )}
              <Chip color={isActive ? 'green' : 'yellow'}>
                {isActive ? 'Active' : 'Waiting'}
              </Chip>
            </div>
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
            </div>
          </div>
        </div>

        {/* Restake & Nomination Info */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-2">
          <div className="flex-1 space-y-3">
            <Typography variant="h5" fw="bold" className="!text-mono-100">
              Total Restaked
            </Typography>
            <div className="flex gap-3 items-center">
              <TotalRestaked totalRestaked={totalRestaked} />
              <Chip color="dark-grey">{restakingMethod ?? 'N/A'}</Chip>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <Typography variant="h5" fw="bold" className="!text-mono-100">
              Nominations
            </Typography>
            <Typography variant="h4" fw="bold">
              {nominations}
            </Typography>
          </div>
        </div>

        {/* Socials & Location */}
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2 items-center">
            {twitter && <SocialChip type="twitter" href={twitter} />}
            {discord && <SocialChip type="discord" href={discord} />}
            {email && <SocialChip type="email" href={`mailto:${email}`} />}
            {web && <SocialChip type="web" href={web} />}
          </div>
          <div className="flex-1">
            {location && (
              <Chip color="dark-grey">
                <MapPinLine className="!fill-mono-0" />
                <Typography
                  variant="body4"
                  fw="bold"
                  className="!text-mono-0 uppercase"
                >
                  {location}
                </Typography>
              </Chip>
            )}
          </div>
        </div>
      </div>

      <TangleBigLogo className="w-48 absolute top-[50%] translate-y-[-50%] right-0" />
    </div>
  );
}
