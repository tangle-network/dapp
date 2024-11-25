import RestakeTabs from '../RestakeTabs';
import DepositForm from './DepositForm';

export const dynamic = 'force-static';

export default function DepositPage() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <RestakeTabs />
      <DepositForm />
    </div>
  );
}
