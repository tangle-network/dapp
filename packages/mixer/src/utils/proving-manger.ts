import { ProvingManagerSetupInput } from '@webb-tools/sdk-core';

// todo move to webb.js
export class ProvingManger {
  constructor(private readonly worker: Worker) {}

  proof(input: ProvingManagerSetupInput): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        this.worker.addEventListener('message', (e) => {
          const payload = e.data as string;
          resolve(payload);
        });
        this.worker.postMessage({
          setup: input,
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
