import RestakeTabs from '../RestakeTabs';
import StyleContainer from '../StyleContainer';
import DepositForm from './DepositForm';

export const dynamic = 'force-static';

export default function DepositPage() {
  return (
    <StyleContainer>
      <RestakeTabs />
      <DepositForm />
    </StyleContainer>
  );
}
