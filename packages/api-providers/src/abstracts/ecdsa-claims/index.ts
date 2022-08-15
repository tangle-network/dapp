export abstract class EcdsaClaims {
  abstract claim(destAccount: string, claim: Uint8Array): Promise<string>;
}
