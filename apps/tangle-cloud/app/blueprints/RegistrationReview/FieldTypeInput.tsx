import { PrimitiveFieldType } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Label } from '@tangle-network/webb-ui-components/components/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/webb-ui-components/components/select';
import { TextField } from '@tangle-network/webb-ui-components/components/TextField';
import { useEffect } from 'react';

export interface FieldTypeInputProps {
  fieldType: PrimitiveFieldType;
  label?: string;
  id: string;
  // TODO: Determine the type of value here
  value?: any;
  onValueChange?: (id: string, newValue: any) => void;
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
): type is {
  Struct: [string, [string, PrimitiveFieldType][]];
} => typeof type === 'object' && 'Struct' in type;

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

const FieldTypeInput: React.FC<FieldTypeInputProps> = ({
  fieldType,
  label,
  id,
  value,
  onValueChange,
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
            <Label>{label}</Label>

            <TextField.Root>
              <TextField.Input value="Void" readOnly type="text" />
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
              <SelectTrigger>
                <SelectValue placeholder={`Select True or False`} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="True">True</SelectItem>
                <SelectItem value="False">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        if (isNumberType(fieldType)) {
          return (
            <div>
              <Label>{label}</Label>

              <TextField.Root>
                <TextField.Input
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
              <Label>{label}</Label>

              <TextField.Root>
                <TextField.Input
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
    return (
      <div>
        <Label>{label} (Optional)</Label>

        <FieldTypeInput
          id={`${id}.Optional`}
          fieldType={fieldType.Optional}
          value={value?.Optional}
          onValueChange={onValueChange}
        />
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
            <FieldTypeInput
              key={`${id}.Array[${index}]`}
              fieldType={elementType}
              id={`${id}.Array[${index}]`}
              value={value?.Array?.[index]}
              onValueChange={onValueChange}
            />
          ))}
        </div>
      </div>
    );
  } else if (isList(fieldType)) {
    return (
      <div>
        <Label>{label} (List)</Label>

        <FieldTypeInput
          id={`${id}.List`}
          value={value?.List}
          onValueChange={onValueChange}
          fieldType={fieldType.List}
        />
      </div>
    );
  } else if (isStruct(fieldType)) {
    const [structName, fields] = fieldType.Struct;

    return (
      <div>
        <Label>
          {label} (Struct {structName})
        </Label>

        <div className="ml-4">
          {fields.map(([fieldName, fieldType]) => (
            <div key={`${id}.Struct.${structName}.${fieldName}`}>
              <Label>{fieldName}</Label>

              <FieldTypeInput
                fieldType={fieldType}
                id={`${id}.Struct.${structName}.${fieldName}`}
                value={value?.Struct?.[structName]?.[fieldName]}
                onValueChange={onValueChange}
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

export default FieldTypeInput;
