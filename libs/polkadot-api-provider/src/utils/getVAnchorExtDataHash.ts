import { BN, u8aToHex } from '@polkadot/util';
import { ensureHex } from '@webb-tools/dapp-config';
import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import { FIELD_SIZE } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

const getVAnchorExtDataHash = (extData: IVariableAnchorExtData): bigint => {
  const tokenIdLE = new Uint8Array(
    new BN(BigInt(extData.token).toString()).toArray('le', 4) // 4 bytes
  );

  const abi = new ethers.utils.AbiCoder();
  const encodedData = abi.encode(
    [
      '(bytes recipient,int256 extAmount,bytes relayer,uint256 fee,uint256 refund,bytes token,bytes encryptedOutput1,bytes encryptedOutput2)',
    ],
    [
      {
        ...extData,
        token: u8aToHex(tokenIdLE), // AbiCoder encode bytes as little endian
      },
    ]
  );

  const hash = ethers.utils.keccak256(encodedData);

  return BigInt(ensureHex(hash)) % FIELD_SIZE.toBigInt();
};

export default getVAnchorExtDataHash;
