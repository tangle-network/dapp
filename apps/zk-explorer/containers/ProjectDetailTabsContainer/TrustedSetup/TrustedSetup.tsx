import TrustedSetupItem from './TrustedSetupItem';
import { getProjectTrustedSetupData } from '../../../server';

export default async function TrustedSetup() {
  const trustedSetupData = await getProjectTrustedSetupData();

  return (
    <div className="p-6 space-y-9">
      {trustedSetupData.map((item, idx) => (
        <TrustedSetupItem {...item} key={idx} />
      ))}
    </div>
  );
}
