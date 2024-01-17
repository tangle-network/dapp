import { fetchProjectTrustedSetupData } from '../../../server/projectDetails';
import TrustedSetupItem from './TrustedSetupItem';

export default async function TrustedSetup() {
  const trustedSetupData = await fetchProjectTrustedSetupData();

  return (
    <div className="p-4 md:p-6 space-y-9">
      {trustedSetupData.map((item, idx) => (
        <TrustedSetupItem {...item} key={idx} />
      ))}
    </div>
  );
}
