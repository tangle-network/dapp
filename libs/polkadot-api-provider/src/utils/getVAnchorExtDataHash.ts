import { BN, u8aToHex } from '@polkadot/util';
import { encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';

// TODO: Remove any type
const getVAnchorExtDataHash = (extData: any): bigint => {
  const tokenIdLE = new Uint8Array(
    new BN(BigInt(extData.token).toString()).toArray('le', 4), // 4 bytes
  );

  const encodedData = encodeAbiParameters(
    parseAbiParameters(
      '(bytes recipient,int256 extAmount,bytes relayer,uint256 fee,uint256 refund,bytes token,bytes encryptedOutput1,bytes encryptedOutput2)',
    ),
    [
      {
        recipient: `0x${extData.recipient.replace(/^0x/, '')}`,
        extAmount: BigInt(extData.extAmount),
        relayer: `0x${extData.relayer.replace(/^0x/, '')}`,
        fee: BigInt(extData.fee),
        refund: BigInt(extData.refund),
        token: u8aToHex(tokenIdLE), // AbiCoder encode bytes as little endian
        encryptedOutput1: `0x${extData.encryptedOutput1.replace(/^0x/, '')}`,
        encryptedOutput2: `0x${extData.encryptedOutput2.replace(/^0x/, '')}`,
      },
    ],
  );

  const hash = keccak256(encodedData);

  return BigInt(hash) % BigInt(1);
};

export default getVAnchorExtDataHash;
