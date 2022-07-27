// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { parseTypedChainId } from '@webb-tools/sdk-core';
// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export const typedChainIdToChainId = (typedChainId: number) => {
  const parsedChainId = parseTypedChainId(typedChainId);
  return parsedChainId.chainId;
};
