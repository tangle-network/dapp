import { FC, useCallback, useState } from 'react';
import {
  isAddress,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  concat,
  toBytes,
  parseUnits,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { useCreditsContext } from '../../app/CreditsProvider';
import useCreditAccountState from '../../data/payments/useCreditAccountState';
import useDomainSeparator from '../../data/payments/useDomainSeparator';
import type { StoredCreditKeys } from '../../utils/payments/indexedDbCreditStorage';
import { TOKEN_DECIMALS } from '../../constants/payments';

const SPEND_TYPEHASH = keccak256(
  toBytes(
    'SpendAuthorization(bytes32 commitment,uint64 serviceId,uint8 jobIndex,uint256 amount,address operator,uint256 nonce,uint64 expiry)',
  ),
);

const validateServiceId = (v: string): bigint | null => {
  try {
    const n = BigInt(v);
    if (n < 0n || n >= 2n ** 64n) return null;
    return n;
  } catch {
    return null;
  }
};

const validateJobIndex = (v: string): number | null => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 255) return null;
  return n;
};

const validateExpiry = (v: string): number | null => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

const SpendAuthContainer: FC = () => {
  const { creditAccounts } = useCreditsContext();
  const { data: domainSeparator } = useDomainSeparator();

  const [selectedAccount, setSelectedAccount] =
    useState<StoredCreditKeys | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [jobIndex, setJobIndex] = useState('0');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [signedAuth, setSignedAuth] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { refetch: refetchAccount } = useCreditAccountState(
    selectedAccount?.commitment as Hex | undefined,
  );

  const isValidOperator = operator === '' || isAddress(operator);

  const handleSign = useCallback(async () => {
    if (
      !selectedAccount ||
      !operator ||
      !isAddress(operator) ||
      !domainSeparator
    ) {
      return;
    }

    if (!selectedAccount.spendingPrivateKey || selectedAccount.isLocked) {
      setError(
        'This credit account is locked. Unlock your shielded keypair to sign authorizations.',
      );
      return;
    }

    // Validate all numeric inputs
    const parsedServiceId = validateServiceId(serviceId);
    if (parsedServiceId === null) {
      setError('Service ID must be a non-negative integer < 2^64');
      return;
    }

    const parsedJobIndex = validateJobIndex(jobIndex);
    if (parsedJobIndex === null) {
      setError('Job index must be 0-255');
      return;
    }

    if (!amount) {
      setError('Amount is required');
      return;
    }

    const parsedExpiry = validateExpiry(expiryMinutes);
    if (parsedExpiry === null) {
      setError('Expiry must be a positive number of minutes');
      return;
    }

    setError(null);
    setSignedAuth(null);

    try {
      // Refetch to get latest nonce — fail closed if read fails
      const { data: freshState } = await refetchAccount();
      if (
        !freshState ||
        typeof freshState !== 'object' ||
        !('nonce' in freshState)
      ) {
        setError(
          'Failed to read credit account state from chain. Cannot determine nonce.',
        );
        return;
      }
      const nonce = BigInt((freshState as { nonce: bigint }).nonce);

      const parsedAmount = parseUnits(amount, TOKEN_DECIMALS);
      const expiry = BigInt(Math.floor(Date.now() / 1000) + parsedExpiry * 60);

      // EIP-712 struct hash
      const structHash = keccak256(
        encodeAbiParameters(
          parseAbiParameters(
            'bytes32, bytes32, uint64, uint8, uint256, address, uint256, uint64',
          ),
          [
            SPEND_TYPEHASH,
            selectedAccount.commitment as Hex,
            parsedServiceId,
            parsedJobIndex,
            parsedAmount,
            operator as Hex,
            nonce,
            expiry,
          ],
        ),
      );

      // EIP-712 digest: \x19\x01 || domainSeparator || structHash
      const EIP712_PREFIX = new Uint8Array([0x19, 0x01]);
      const digest = keccak256(
        concat([
          EIP712_PREFIX,
          toBytes(domainSeparator as Hex),
          toBytes(structHash),
        ]),
      );

      // Raw signature (no personal_sign prefix)
      const account = privateKeyToAccount(
        selectedAccount.spendingPrivateKey as Hex,
      );
      const signature = await account.sign({ hash: digest });

      const auth = {
        commitment: selectedAccount.commitment,
        serviceId: parsedServiceId.toString(),
        jobIndex: parsedJobIndex,
        amount: parsedAmount.toString(),
        operator,
        nonce: nonce.toString(),
        expiry: expiry.toString(),
        signature,
      };

      setSignedAuth(JSON.stringify(auth, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing failed');
    }
  }, [
    selectedAccount,
    serviceId,
    jobIndex,
    amount,
    operator,
    expiryMinutes,
    domainSeparator,
    refetchAccount,
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Authorize Spend</h2>

      <p className="text-sm text-muted-foreground">
        Sign an off-chain EIP-712 spend authorization. No ZK proof needed — just
        a cheap signature from your ephemeral spending key.
      </p>

      {creditAccounts.length === 0 ? (
        <div className="p-4 text-sm text-center border rounded-lg border-border text-muted-foreground">
          No credit accounts. Fund one first from the shielded pool.
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Credit Account
            </label>

            <select
              value={selectedAccount?.commitment ?? ''}
              onChange={(e) => {
                const acct = creditAccounts.find(
                  (a) => a.commitment === e.target.value,
                );
                setSelectedAccount(acct ?? null);
                setSignedAuth(null);
              }}
              className="w-full p-3 text-sm border rounded-lg border-border bg-card text-foreground"
            >
              <option value="">Select account...</option>
              {creditAccounts.map((acct) => (
                <option key={acct.commitment} value={acct.commitment}>
                  {acct.label ?? acct.commitment.slice(0, 18) + '...'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Service ID
              </label>

              <input
                type="text"
                placeholder="e.g. 1"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full p-3 text-sm border rounded-lg border-border bg-card outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Job Index (0-255)
              </label>

              <input
                type="text"
                placeholder="0"
                value={jobIndex}
                onChange={(e) => setJobIndex(e.target.value)}
                className="w-full p-3 text-sm border rounded-lg border-border bg-card outline-none text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Amount
            </label>

            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => {
                if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                  setAmount(e.target.value);
                }
              }}
              className="w-full p-3 text-sm border rounded-lg border-border bg-card outline-none text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Operator Address
            </label>

            <input
              type="text"
              placeholder="0x..."
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className={`w-full p-3 text-sm font-mono border rounded-lg bg-card outline-none text-foreground ${
                !isValidOperator ? 'border-red-50' : 'border-border'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Expiry (minutes)
            </label>

            <input
              type="text"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="w-full p-3 text-sm border rounded-lg border-border bg-card outline-none text-foreground"
            />
          </div>

          {error && (
            <p className="text-xs text-red-70 dark:text-red-50">{error}</p>
          )}

          {signedAuth && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Signed Authorization (share with operator)
              </span>

              <pre className="p-3 overflow-x-auto text-xs border rounded-lg border-border bg-muted/40 text-foreground">
                {signedAuth}
              </pre>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(signedAuth)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSign}
            disabled={
              !selectedAccount ||
              !serviceId ||
              !amount ||
              !operator ||
              !isValidOperator ||
              !domainSeparator
            }
            className="w-full px-4 py-3 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!domainSeparator
              ? 'Waiting for contract...'
              : 'Sign Authorization'}
          </button>
        </>
      )}
    </div>
  );
};

export default SpendAuthContainer;
