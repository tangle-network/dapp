import { PrimitiveFieldType } from '../types/blueprint';
import { Label } from '@tangle-network/ui-components/components/Label';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { TextField } from '@tangle-network/ui-components/components/TextField';
import { useEffect } from 'react';

export interface PrimitiveFieldTypeInputProps {
  fieldType: PrimitiveFieldType;
  label?: string;
  id: string;
  // TODO: Determine the type of value here
  value?: any;
  onValueChange?: (id: string, newValue: any) => void;
  tabIndex?: number;
}

const isOptional = (
  type: PrimitiveFieldType,
): type is { Optional: PrimitiveFieldType } =>
  typeof type === 'object' && 'Optional' in type;

const isArray = (
  type: PrimitiveFieldType,
): type is { Array: [number, PrimitiveFieldType] } =>
  typeof type === 'object' && 'Array' in type;

const isList = (
  type: PrimitiveFieldType,
): type is { List: PrimitiveFieldType } =>
  typeof type === 'object' && 'List' in type;

const isStruct = (
  type: PrimitiveFieldType,
): type is { Struct: PrimitiveFieldType[] } =>
  typeof type === 'object' && 'Struct' in type;

const isNumberType = (
  type: string,
): type is
  | 'Uint8'
  | 'Int8'
  | 'Uint16'
  | 'Int16'
  | 'Uint32'
  | 'Int32'
  | 'Uint64'
  | 'Int64' =>
  [
    'Uint8',
    'Int8',
    'Uint16',
    'Int16',
    'Uint32',
    'Int32',
    'Uint64',
    'Int64',
  ].includes(type);

const isTextType = (
  type: string,
): type is 'Text' | 'Bytes' | 'AccountId' | 'String' =>
  ['Text', 'Bytes', 'AccountId', 'String'].includes(type);

const PrimitiveFieldTypeInput: React.FC<PrimitiveFieldTypeInputProps> = ({
  fieldType,
  label,
  id,
  value,
  onValueChange,
  tabIndex,
}) => {
  // If the field type is Void, set the value to 'Void'
  useEffect(() => {
    if (typeof fieldType === 'string' && fieldType === 'Void') {
      onValueChange?.(id, 'Void');
    }
  }, [fieldType, id, onValueChange]);

  if (typeof fieldType === 'string') {
    switch (fieldType) {
      case 'Void':
        return (
          <div>
            <Label>{label} (Void)</Label>

            <TextField.Root>
              <TextField.Input
                tabIndex={tabIndex}
                value="Void"
                readOnly
                type="text"
              />
            </TextField.Root>
          </div>
        );
      case 'Bool':
        return (
          <div>
            <Label>{label} (Bool)</Label>

            <Select
              value={value}
              onValueChange={
                onValueChange !== undefined
                  ? (value) => onValueChange(id, value)
                  : undefined
              }
            >
              <SelectTrigger tabIndex={tabIndex} className="max-w-md">
                <SelectValue placeholder={`Select True or False`} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={'true'}>True</SelectItem>
                <SelectItem value={'false'}>False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        if (isNumberType(fieldType)) {
          return (
            <div>
              <Label>
                {label} ({fieldType})
              </Label>

              <TextField.Root>
                <TextField.Input
                  tabIndex={tabIndex}
                  type="number"
                  inputMode="numeric"
                  placeholder={fieldType}
                  value={value ?? ''}
                  onChange={
                    onValueChange !== undefined
                      ? (event) => onValueChange?.(id, event.target.value)
                      : undefined
                  }
                />
              </TextField.Root>
            </div>
          );
        } else if (isTextType(fieldType)) {
          return (
            <div>
              <Label>
                {label} ({fieldType})
              </Label>

              <TextField.Root>
                <TextField.Input
                  tabIndex={tabIndex}
                  type="text"
                  inputMode="text"
                  placeholder={fieldType}
                  value={value ?? ''}
                  onChange={
                    onValueChange !== undefined
                      ? (event) => onValueChange?.(id, event.target.value)
                      : undefined
                  }
                />
              </TextField.Root>
            </div>
          );
        }
    }
  } else if (isOptional(fieldType)) {
    const isEnabled = value?.Optional !== null && value?.Optional !== undefined;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckBox
            id={`${id}.OptionalToggle`}
            isChecked={isEnabled}
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                // Initialise inner value as undefined so nested input can manage it.
                onValueChange?.(id, { Optional: undefined });
              } else {
                onValueChange?.(id, { Optional: null });
              }
            }}
          />
          <Label>{label} (Optional)</Label>
        </div>

        {isEnabled && (
          <div className="ml-4">
            <PrimitiveFieldTypeInput
              id={`${id}.Optional`}
              fieldType={fieldType.Optional}
              value={value?.Optional}
              onValueChange={onValueChange}
              tabIndex={tabIndex}
            />
          </div>
        )}
      </div>
    );
  } else if (isArray(fieldType)) {
    const [length, elementType] = fieldType.Array;
    return (
      <div>
        <Label>
          {label} (Array, length: {length})
        </Label>

        <div className="space-y-2">
          {Array.from({ length }).map((_, index) => (
            <PrimitiveFieldTypeInput
              key={`${id}.Array[${index}]`}
              fieldType={elementType}
              id={`${id}.Array[${index}]`}
              value={value?.Array?.[index]}
              onValueChange={onValueChange}
              tabIndex={tabIndex}
            />
          ))}
        </div>
      </div>
    );
  } else if (isList(fieldType)) {
    return (
      <div>
        <Label>{label} (List)</Label>

        {/* TODO: Question List */}
        {/* <FieldTypeInput
          id={`${id}.List`}
          value={value?.List}
          onValueChange={onValueChange}
          fieldType={fieldType.List}
          tabIndex={tabIndex}
        /> */}
      </div>
    );
  } else if (isStruct(fieldType)) {
    const fields = fieldType.Struct;

    return (
      <div>
        <Label>{label} (Struct)</Label>

        <div className="ml-4">
          {fields.map((fieldType, idx) => (
            <div key={`${id}.Struct.${idx}`}>
              <Label>Field {idx + 1}</Label>

              <PrimitiveFieldTypeInput
                fieldType={fieldType}
                id={`${id}.Struct.${idx}`}
                value={value?.Struct?.[idx]}
                onValueChange={onValueChange}
                tabIndex={tabIndex}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  console.error(`Invalid field type: ${JSON.stringify(fieldType)}`);

  return null;
};

export default PrimitiveFieldTypeInput;
