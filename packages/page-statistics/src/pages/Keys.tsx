import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { useSubQLtime } from '@webb-dapp/page-statistics/provider/stats-provider';
import { KeygenTable } from '@webb-dapp/webb-ui-components';
import { KeyStatusCard } from '@webb-dapp/webb-ui-components/components/KeyStatusCard';
import { useEffect, useState } from 'react';

const Keys = () => {
  const [time] = useSubQLtime();
  const [clock, setClock] = useState('');
  useEffect(() => {
    const i = () => {
      setClock(time.current.toTimeString());
    };
    const t = setInterval(i, 1000);
    return () => clearInterval(t);
  }, [time]);
  return (
    <div>
      <div>
        <b>{clock}</b>
      </div>
      <div className='flex space-x-4'>
        <KeyStatusCard
          title='Active Key'
          titleInfo='The public key of the DKG protocol that is currently active.'
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
          titleInfo='The public key of the DKG protocol that will be active after the next authority set change.'
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
