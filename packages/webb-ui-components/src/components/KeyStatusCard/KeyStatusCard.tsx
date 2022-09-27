import { Avatar, AvatarGroup, Button, Card, Chip } from '@webb-dapp/webb-ui-components';
import { Link } from 'react-router-dom';

import { KeyValueWithButton } from '../KeyValueWithButton';
import { LabelWithValue } from '../LabelWithValue';
import { TimeProgress } from '../TimeProgress';
import { TitleWithInfo } from '../TitleWithInfo';
import { KeyStatusCardProps } from './types';
import { formatDateToUtc } from '@webb-dapp/webb-ui-components/utils';

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
  instance,
  ...props
}) => {
  return (
    <Card {...props}>
      {/** Top */}
      <div className='flex justify-between w-full'>
        <div className='flex items-center space-x-2'>
          <TitleWithInfo title={title} info={titleInfo} />
          <LabelWithValue label='session: ' value={sessionNumber} />
          <Chip color='green' className='inline-block uppercase'>
            {keyType}
          </Chip>
        </div>
        <KeyValueWithButton keyValue={keyVal} />
      </div>

      {/* * Content */}
      <TimeProgress now={instance} startTime={startTime} endTime={endTime} />
      {/** Bottom */}
      <div className='flex items-center justify-between'>
        <AvatarGroup total={totalAuthorities}>
          {Array.from(authorities).map((aut, idx) => (
            <Avatar sourceVariant='address' key={`${aut}${idx}`} value={aut} />
          ))}
        </AvatarGroup>
        <Link to={fullDetailUrl}>
          <Button className='uppercase' varirant='link' as='span' size='sm'>
            See full details
          </Button>
        </Link>
      </div>
    </Card>
  );
};
