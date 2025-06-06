import { randNumber } from '@ngneat/falso';
import { PrimitiveFieldType } from '../../../types/blueprint';

const types = [
  'Optional',
  'Array',
  'List',
  'Struct',
  'Void',
  'Bool',
  'Uint8',
  'Int8',
  'Uint16',
  'Int16',
  'Uint32',
  'Int32',
  'Uint64',
  'Int64',
  'String',
] as const;

const specialTypes = ['Struct', 'List', 'Optional', 'Array'] as const;

const randFieldType = (allTypes = true): PrimitiveFieldType => {
  const type = allTypes
    ? types[Math.floor(Math.random() * types.length)]
    : specialTypes[Math.floor(Math.random() * specialTypes.length)];

  if (type === 'Optional') {
    return {
      Optional: randFieldType(),
    };
  }

  if (type === 'Array') {
    return {
      Array: [randNumber({ min: 1, max: 5 }), randFieldType()],
    } as const;
  }

  if (type === 'List') {
    return {
      List: randFieldType(),
    } as const;
  }

  if (type === 'Struct') {
    return {
      Struct: [
        {
          Array: [randNumber({ min: 1, max: 5 }), randFieldType()],
        },
      ],
    } as const;
  }

  return type;
};

export default randFieldType;
