import cx from 'classnames';
import { Link } from 'react-router-dom';

const Deposit = () => {
  return (
    <div
      className={cx(
        'w-full lg:max-w-xl min-h-[710px] h-full bg-mono-0 dark:bg-mono-190',
        'p-9 rounded-xl space-y-4 grow',
        'border border-mono-40 dark:border-mono-160',
        'flex flex-col'
      )}
    >
      <ul className="flex items-center space-x-4">
        {['deposit', 'transfer', 'withdraw'].map((tab, idx) => (
          <li key={`${tab}-${idx}`}>
            <Link
              to={`/bridge/${tab}`}
              className={cx(
                'h4 font-bold capitalize',

                'text-mono-100 radix-state-active:text-mono-200',
                'dark:radix-state-active:!text-mono-0'
              )}
            >
              {tab}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Deposit;
