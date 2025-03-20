import { randNumber } from '@ngneat/falso';
import Keyring from '@polkadot/keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { BadgeEnum } from '../types/BadgeEnum';

export type AccountType = {
  id: string;
  totalPoints: number;
  badges: BadgeEnum[];
};

function fakeAccount(keyring: Keyring) {
  const mnemonic = mnemonicGenerate();
  const pair = keyring.createFromUri(mnemonic);

  const badgeEnumLength = Object.values(BadgeEnum).length;

  return {
    id: pair.address,
    totalPoints: randNumber({ min: 100, max: 10_000 }),
    badges: Array.from(
      new Set(
        Array.from(
          { length: randNumber({ min: 1, max: badgeEnumLength - 1 }) },
          () =>
            Object.values(BadgeEnum)[
              randNumber({ min: 0, max: badgeEnumLength - 1 })
            ],
        ),
      ),
    ),
  } satisfies AccountType;
}

// TODO: Implement this function
export const fetchAccounts = async (limit = 20, offset = 0, query = '') => {
  const keyring = new Keyring({ type: 'sr25519' });

  const accounts = Array.from({ length: limit }, () => fakeAccount(keyring))
    .slice(offset, offset + limit)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    pagination: {
      limit,
      offset,
      total: accounts.length,
    },
    data: accounts,
  };
};
