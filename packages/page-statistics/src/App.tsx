import { ApolloClient, InMemoryCache } from '@apollo/client';
import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { KeyStatusCard } from '@webb-dapp/webb-ui-components';
import { FC } from 'react';

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:4000',
});

const App: FC = () => {
  return (
    <div>
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
    </div>
  );
};

export default App;
