// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';

export interface StorageHandler<T> {
  inner: T;

  fetch(key: string): Promise<T>;

  commit(key: string, data: T): Promise<void>;
}

export class Storage<Store> extends EventBus<{
  update: Store;
}> {
  static instances = new Map<string, Storage<any>>();

  static get<Store extends Record<string, unknown>>(key: string): Storage<Store> {
    return Storage.instances.get(key) as Storage<Store>;
  }

  static async newFresh<Store>(name: string, handler: StorageHandler<Store>): Promise<Storage<Store>> {
    const instance = new Storage<Store>(name, handler);

    Storage.instances.set(name, instance);
    await instance.commit(name, handler.inner);

    return instance;
  }

  static async newFromCache<Store>(name: string, data: Omit<StorageHandler<Store>, 'inner'>): Promise<Storage<Store>> {
    const storage = await data.fetch(name);
    const instance = new Storage<Store>(name, {
      ...data,
      inner: storage,
    });

    Storage.instances.set(name, instance);

    return instance;
  }

  readonly fetch: StorageHandler<Store>['fetch'];
  private readonly commit: StorageHandler<Store>['commit'];
  private data: Store;

  private constructor(readonly name: string, data: StorageHandler<Store>) {
    super();

    this.data = data.inner;
    this.fetch = data.fetch;
    this.commit = data.commit;
  }

  async get<Key extends keyof Store>(key: Key): Promise<Store[Key]> {
    const data = this.data[key];

    return data;
  }

  async dump() {
    return this.data;
  }

  async set<Key extends keyof Store>(key: Key, data: Store[Key]) {
    this.data = {
      ...this.data,
      [key]: data,
    };
    await this.commit(this.name, this.data);
    this.emit('update', this.data);
  }
}
