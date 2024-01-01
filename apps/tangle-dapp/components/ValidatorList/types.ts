import { Validator } from '../../types';

type KeysOf<T> = keyof T;

type ExcludeKeys<T, K extends keyof any> = Pick<T, Exclude<KeysOf<T>, K>>;

export type SortableValidatorKeys = ExcludeKeys<
  Validator,
  'address' | 'identity' | 'effectiveAmountStaked' | 'selfStaked'
>;

type SortBy = {
  key: keyof SortableValidatorKeys;
  title: string;
};

export type ValidatorListProps = {
  validators: Validator[];
  selectedValidators: string[];
  setSelectedValidators: (selectedValidators: string[]) => void;
  sortBy: SortBy[];
};

export type SortButtonProps = {
  title: string;
  isSelected: boolean;
  onClick: () => void;
};
