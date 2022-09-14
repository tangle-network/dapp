import { ApolloClient, InMemoryCache } from '@apollo/client';
import StatsDemo from '@webb-dapp/page-statistics/StatsDemo';
import { ThemeSwitcher } from '@webb-dapp/webb-ui-components';
import { FC } from 'react';

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:4000',
});

const App: FC = () => {
  return (
    <>
      <div className='min-h-[72px] bg-mono-0 dark:bg-mono-180 mb-8 flex items-center justify-end p-4'>
        <ThemeSwitcher />
      </div>
      <StatsDemo />
    </>
  );
};

export default App;
