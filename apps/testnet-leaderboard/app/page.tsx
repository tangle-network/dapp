import cx from 'classnames';

import CountdownSection from '../components/CountdownSection';
import FAQSection from '../components/FAQSection';
import RankingTableSection from '../components/RankingTableSection';

export default function Index() {
  return (
    <div
      className={cx(
        'bg-body bg-repeat-y bg-center',
        'py-[60px] md:py-[90px] px-2 lg:px-0'
      )}
    >
      <div className="lg:max-w-[1440px] lg:mx-auto">
        <div
          className={cx(
            'lg:w-[77.5%] lg:mx-auto py-[48px] px-2 lg:px-[192px]',
            'border-2 border-mono-0 rounded-2xl',
            'flex flex-col gap-[64px]',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)]'
          )}
        >
          <CountdownSection />
          <hr className="border-mono-200" />
          <RankingTableSection />
          <hr className="border-mono-200" />
          <FAQSection />
        </div>
      </div>
    </div>
  );
}
