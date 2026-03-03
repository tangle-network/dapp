import { Input } from '@tangle-network/ui-components/components/Input';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { decodeAddress, encodeAddress, isAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

export interface SubstrateAddressInfo {
  /** The SS58 encoded address */
  ss58Address: string;
  /** The raw public key (32 bytes, hex) */
  publicKey: `0x${string}`;
}

interface SubstrateKeyInputProps {
  value: string;
  onChange: (value: string, addressInfo: SubstrateAddressInfo | null) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

/**
 * Input component for Substrate SS58 addresses
 * Validates the address and extracts the public key
 */
const SubstrateKeyInput: FC<SubstrateKeyInputProps> = ({
  value,
  onChange,
  disabled = false,
  error: externalError,
  className,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const validateAddress = useCallback(
    (input: string): SubstrateAddressInfo | null => {
      if (!input || input.trim() === '') {
        setLocalError(null);
        return null;
      }

      const trimmed = input.trim();

      // Check if it's a valid SS58 address
      try {
        if (isAddress(trimmed)) {
          const publicKey = decodeAddress(trimmed);
          const publicKeyHex = u8aToHex(publicKey) as `0x${string}`;

          // Re-encode to ensure consistent format
          const ss58Address = encodeAddress(publicKey);

          setLocalError(null);
          return {
            ss58Address,
            publicKey: publicKeyHex,
          };
        }
      } catch {
        // Not a valid address
      }

      setLocalError(
        'Invalid Substrate address. Please enter a valid SS58 address.',
      );
      return null;
    },
    [],
  );

  const handleChange = useCallback(
    (newValue: string) => {
      const addressInfo = validateAddress(newValue);
      onChange(newValue, addressInfo);
    },
    [onChange, validateAddress],
  );

  const displayError = externalError || localError;

  return (
    <div className={twMerge('space-y-2', className)}>
      <Input
        id="substrate-address-input"
        placeholder="Enter your Substrate address (e.g., tgDJH2vbc9sYC2fs...)..."
        value={value}
        onChange={handleChange}
        isDisabled={disabled}
        isInvalid={!!displayError}
        isControlled
        inputClassName="font-mono text-sm"
      />

      {displayError && (
        <Typography variant="body2" className="text-red-500">
          {displayError}
        </Typography>
      )}
    </div>
  );
};

export default SubstrateKeyInput;
