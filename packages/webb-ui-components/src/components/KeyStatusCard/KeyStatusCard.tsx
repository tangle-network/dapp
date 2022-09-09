import { Avatar, AvatarGroup, Button, Card, Chip } from '@webb-dapp/webb-ui-components';

import { KeyValueWithButton } from '../KeyValueWithButton';
import { LabelWithValue } from '../LabelWithValue';
import { TimeProgress } from '../TimeProgress';
import { TitleWithInfo } from '../TitleWithInfo';
import { KeyStatusCardProps } from './types';

/**
 * The `KeyStatusCard` component displays the current key and next key data
 *
 * ```jsx
 *  import { useKeyStatusSeedData } from "@webb-dapp/webb-ui-components";
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
  keyType,
  keyVal,
  sessionNumber,
  startTime,
  title,
  titleInfo,
  totalAuthorities,
  ...props
}) => {
  return (
    <Card {...props}>
      {/** Top */}
      <div className='flex justify-between w-full'>
        <div className='flex items-center space-x-2'>
          <TitleWithInfo title={title} info={titleInfo} />
          <LabelWithValue label='session: ' value={sessionNumber} />
          <Chip color='green' className='inline-block capitalize'>
            {keyType}
          </Chip>
        </div>
        <KeyValueWithButton keyValue={keyVal} />
      </div>
      {/* * Content */}
      <TimeProgress startTime={startTime} endTime={endTime} />
      {/** Bottom */}
      <div className='flex items-center justify-between'>
        <AvatarGroup total={totalAuthorities}>
          {Object.values(authorities).map((au) => (
            <Avatar key={au.id} src={au.avatarUrl} alt={au.id} />
          ))}
        </AvatarGroup>
        <Button href={fullDetailUrl} target='_blank' varirant='link' className='uppercase' size='sm'>
          See full details
        </Button>
      </div>
    </Card>
  );
};
