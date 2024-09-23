import MapPinLine from '@webb-tools/icons/MapPinLine';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import { SocialChip } from '@webb-tools/webb-ui-components/components/SocialChip';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'div'> {
  email?: string;
  githubUrl?: string;
  location?: string;
  locationPlaceholder?: string;
  twitterUrl?: string;
  webUrl?: string;
}

const ValidatorSocials: FC<Props> = ({
  email,
  githubUrl,
  location,
  locationPlaceholder = 'Unknown',
  twitterUrl,
  webUrl,
  ...divProps
}) => {
  const hasSocialLinks = twitterUrl || githubUrl || email || webUrl;

  return (
    <div
      {...divProps}
      className={twMerge('flex gap-4 min-h-[30px]', divProps.className)}
    >
      {hasSocialLinks && (
        <div className="flex items-center flex-1 gap-2">
          {twitterUrl && <SocialChip type="twitter" href={twitterUrl} />}
          {githubUrl && <SocialChip type="github" href={githubUrl} />}
          {email && <SocialChip type="email" href={`mailto:${email}`} />}
          {webUrl && <SocialChip type="website" href={webUrl} />}
        </div>
      )}

      {(location || locationPlaceholder) && (
        <div className="flex-1">
          <Chip className="inline-flex items-center gap-2" color="dark-grey">
            <MapPinLine className="!fill-current" />

            {location || locationPlaceholder}
          </Chip>
        </div>
      )}
    </div>
  );
};

export default ValidatorSocials;
