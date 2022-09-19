import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { KeyStatusCard } from '@webb-dapp/webb-ui-components/components/KeyStatusCard';

import { KeygenTable } from '../containers';

const Keys = () => {
  return (
    <div>
      <div className='flex space-x-4'>
        <KeyStatusCard
          title='Active Key'
          titleInfo='Active Key'
          sessionNumber={3456}
          keyType='current'
          keyVal='0x1234567890abcdef'
          startTime={randRecentDate()}
          endTime={randSoonDate()}
          authorities={{
            nepoche: {
              id: 'nepoche',
              avatarUrl: 'https://github.com/nepoche.png',
            },
            AhmedKorim: {
              id: 'AhmedKorim',
              avatarUrl: 'https://github.com/AhmedKorim.png',
            },
            AtelyPham: {
              id: 'AtelyPham',
              avatarUrl: 'https://github.com/AtelyPham.png',
            },
          }}
          totalAuthorities={randNumber({ min: 10, max: 20 })}
          fullDetailUrl='https://webb.tools'
        />
        <KeyStatusCard
          title='Next Key'
          titleInfo='Next Key'
          sessionNumber={3456}
          keyType='next'
          keyVal='0x1234567890abcdef'
          startTime={randRecentDate()}
          endTime={randSoonDate()}
          authorities={{
            nepoche: {
              id: 'nepoche',
              avatarUrl: 'https://github.com/nepoche.png',
            },
            AhmedKorim: {
              id: 'AhmedKorim',
              avatarUrl: 'https://github.com/AhmedKorim.png',
            },
            AtelyPham: {
              id: 'AtelyPham',
              avatarUrl: 'https://github.com/AtelyPham.png',
            },
          }}
          totalAuthorities={randNumber({ min: 10, max: 20 })}
          fullDetailUrl='https://webb.tools'
        />
      </div>

      <div className='mt-4'>
        <KeygenTable />
      </div>
    </div>
  );
};

export default Keys;
