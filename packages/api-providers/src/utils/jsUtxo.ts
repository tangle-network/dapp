// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { Backend, Curve } from '@webb-tools/wasm-utils';

export async function createUtxo(
  curve: Curve,
  backend: Backend,
  input_size: number,
  anchor_size: number,
  amount: string,
  chain_id: string,
  index?: string,
  private_key?: Uint8Array,
  blinding?: Uint8Array
) {
  const wasm = await import('@webb-tools/wasm-utils');
  return new wasm.JsUtxo(curve, backend, input_size, anchor_size, amount, chain_id, index, private_key, blinding);
}

export async function createUtxoBn254CT2(
  input_size: number,
  amount: string,
  chain_id: string,
  index?: string,
  private_key?: Uint8Array,
  blinding?: Uint8Array
) {
  const wasm = await import('@webb-tools/wasm-utils');
  return new wasm.JsUtxo('Bn254', 'Arkworks', input_size, 2, amount, chain_id, index, private_key, blinding);
}
