import RestakeAssetDetailCard from '../../../components/RestakeDetailCard/RestakeAssetDetailCard';
import RestakeOperatorDetailCard from '../../../components/RestakeDetailCard/RestakeOperatorDetailCard';
import DepositForm from './DepositForm';

export default function DepositPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:justify-evenly md:grid-cols-2">
      <DepositForm className="w-full max-w-lg mx-auto" />

      <div className="md:mt-[60px] max-w-lg mx-auto w-full">
        <div className="space-y-4">
          <RestakeAssetDetailCard
            assetExternalLink="https://tangle.exchange"
            getAssetLink="https://tangle.exchange"
            limit={1000}
            name="Tangle"
            symbol="TGL"
            tvl={10000}
          />

          <RestakeOperatorDetailCard
            delegationCount={12}
            identityEmailLink="mailto:hello@webb.tools"
            identityName="WebbValidator"
            identityWebLink="https://webb.tools"
            identityXLink="https://x.com/@webbprotocol"
            isDelegated={true}
            operatorAccountId="5F9jS22zsSzmWNXKt4kknBsrhVAokEQ9e3UcuBeg21hkzqWz"
            totalStaked="1,000 tTNT"
            validatorExternalLink="https://x.com/@webbprotocol"
            location="Singapore"
          />
        </div>
      </div>
    </div>
  );
}
