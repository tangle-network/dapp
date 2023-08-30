import { Avatar, AvatarGroup, Button, Card, Chip } from '..';
import { Typography } from '../../typography/Typography';

import { Link } from 'react-router-dom';

import { KeyValueWithButton } from '../KeyValueWithButton';
import { LabelWithValue } from '../LabelWithValue';
import { TimeProgress } from '../TimeProgress';
import { TitleWithInfo } from '../TitleWithInfo';
import { KeyStatusCardProps } from './types';

/**
 * The `KeyStatusCard` component displays the current key and next key data
 *
 * ```jsx
 *  import { useKeyStatusSeedData } from "@webb-tools/webb-ui-components";
 *
 *  const statusCardData = useKeyStatusSeedData();
 *
 *  // ...
 *
 *  <KeyStatusCard className='max-w-[680px] mt-6' {...statusCardData} />
 * ```
 */
export const KeyStatusCard: React.FC<KeyStatusCardProps> = ({
  authorities,
  endTime,
  fullDetailUrl,
  instance,
  keyType,
  keyVal,
  sessionNumber,
  startTime,
  title,
  titleInfo,
  totalAuthorities,
  showDetails,
  ...props
}) => {
  const randomAddress =
    '0x03856d8db4bf0e3d52a72c447ba8003f9a2c2268fd4ac4db95b890869ec842f3c7';

  const PlaceholderAvatarList = Array(5)
    .fill(null)
    .map((_, idx) => (
      <Avatar sourceVariant="address" key={idx} value={randomAddress} />
    ));

  return (
    <Card {...props}>
      {/** Top */}
      <div className="flex justify-between w-full">
        <div className="flex items-center space-x-2">
          <TitleWithInfo title={title} info={titleInfo} variant="h5" />
          <Chip color="green" className="inline-block">
            {keyType}
          </Chip>
          <LabelWithValue label="session: " value={`#${sessionNumber}`} />
        </div>
        <div className="flex items-center">
          <Typography variant="para1" fw="bold" className="mr-2 text-xs">
            KEY
          </Typography>
          <KeyValueWithButton keyValue={keyVal} />
        </div>
      </div>

      {/* * Content */}
      <TimeProgress startTime={startTime} endTime={endTime} />

      {/** Bottom */}
      <div className="flex items-center justify-between">
        <AvatarGroup total={totalAuthorities === 0 ? 5 : totalAuthorities}>
          {totalAuthorities === 0
            ? PlaceholderAvatarList
            : Array.from(authorities).map((aut, idx) => (
                <Avatar
                  sourceVariant="address"
                  key={`${aut}${idx}`}
                  value={aut}
                />
              ))}
        </AvatarGroup>
        {showDetails ? (
          <Link to={fullDetailUrl}>
            <Button variant="link" as="span" size="sm">
              View Details
            </Button>
          </Link>
        ) : (
          <Button
            variant="link"
            as="span"
            size="sm"
            isDisabled={true}
            className="cursor-not-allowed"
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
};
