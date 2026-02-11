/**
 * Recursive component that renders form fields based on a TLV v2 SchemaField.
 */

import { FC, useCallback, useMemo } from 'react';
import { Button, Input, Typography } from '@tangle-network/ui-components';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';
import {
  BlueprintFieldKind,
  getDefaultValue,
  type FormFieldValue,
  type SchemaField,
} from '@tangle-network/tangle-shared-ui/codec';

interface SchemaFieldInputProps {
  field: SchemaField;
  value: FormFieldValue;
  onChange: (value: FormFieldValue) => void;
  path: string;
}

const kindLabel = (kind: BlueprintFieldKind): string => {
  return BlueprintFieldKind[kind] ?? `Kind(${kind})`;
};

const getIntBounds = (
  kind: BlueprintFieldKind,
): { min?: string; max?: string } => {
  switch (kind) {
    case BlueprintFieldKind.Uint8:
      return { min: '0', max: '255' };
    case BlueprintFieldKind.Int8:
      return { min: '-128', max: '127' };
    case BlueprintFieldKind.Uint16:
      return { min: '0', max: '65535' };
    case BlueprintFieldKind.Int16:
      return { min: '-32768', max: '32767' };
    case BlueprintFieldKind.Uint32:
      return { min: '0', max: '4294967295' };
    case BlueprintFieldKind.Int32:
      return { min: '-2147483648', max: '2147483647' };
    default:
      return {};
  }
};

const isSmallInt = (kind: BlueprintFieldKind): boolean => {
  return (
    kind === BlueprintFieldKind.Uint8 ||
    kind === BlueprintFieldKind.Int8 ||
    kind === BlueprintFieldKind.Uint16 ||
    kind === BlueprintFieldKind.Int16 ||
    kind === BlueprintFieldKind.Uint32 ||
    kind === BlueprintFieldKind.Int32
  );
};

const isBigInt = (kind: BlueprintFieldKind): boolean => {
  return (
    kind === BlueprintFieldKind.Uint64 ||
    kind === BlueprintFieldKind.Int64 ||
    kind === BlueprintFieldKind.Uint128 ||
    kind === BlueprintFieldKind.Int128 ||
    kind === BlueprintFieldKind.Uint256 ||
    kind === BlueprintFieldKind.Int256
  );
};

export const SchemaFieldInput: FC<SchemaFieldInputProps> = ({
  field,
  value,
  onChange,
  path,
}) => {
  const { kind, name } = field;
  const label = name || path;

  if (kind === BlueprintFieldKind.Void) {
    return (
      <div className="py-1">
        <Typography variant="body3" className="text-mono-100">
          {label} (void)
        </Typography>
      </div>
    );
  }

  if (kind === BlueprintFieldKind.Bool) {
    return (
      <div className="flex items-center gap-2 py-1">
        <CheckBox
          isChecked={value === true}
          onChange={() => onChange(!value)}
        />

        <Typography variant="body2">{label}</Typography>
      </div>
    );
  }

  if (isSmallInt(kind)) {
    const bounds = getIntBounds(kind);
    return (
      <div className="py-1">
        <Typography variant="body2" className="mb-1">
          {label}{' '}
          <span className="text-mono-100 text-xs">({kindLabel(kind)})</span>
        </Typography>

        <Input
          id={path}
          type="number"
          isControlled
          value={(value as string) ?? '0'}
          onChange={(v) => onChange(v)}
          placeholder={`${bounds.min ?? '0'} to ${bounds.max ?? '...'}`}
        />
      </div>
    );
  }

  if (isBigInt(kind)) {
    return (
      <div className="py-1">
        <Typography variant="body2" className="mb-1">
          {label}{' '}
          <span className="text-mono-100 text-xs">({kindLabel(kind)})</span>
        </Typography>

        <Input
          id={path}
          isControlled
          value={(value as string) ?? '0'}
          onChange={(v) => onChange(v)}
          placeholder="Enter integer value"
        />
      </div>
    );
  }

  if (kind === BlueprintFieldKind.Address) {
    return (
      <div className="py-1">
        <Typography variant="body2" className="mb-1">
          {label} <span className="text-mono-100 text-xs">(Address)</span>
        </Typography>

        <Input
          id={path}
          isControlled
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          placeholder="0x..."
        />
      </div>
    );
  }

  if (
    kind === BlueprintFieldKind.Bytes32 ||
    kind === BlueprintFieldKind.FixedBytes
  ) {
    const expectedLen =
      kind === BlueprintFieldKind.Bytes32 ? 32 : field.arrayLength;
    return (
      <div className="py-1">
        <Typography variant="body2" className="mb-1">
          {label}{' '}
          <span className="text-mono-100 text-xs">
            ({kindLabel(kind)}, {expectedLen} bytes)
          </span>
        </Typography>

        <Input
          id={path}
          isControlled
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          placeholder={`0x... (${expectedLen * 2} hex chars)`}
        />
      </div>
    );
  }

  if (kind === BlueprintFieldKind.String) {
    return (
      <div className="py-1">
        <Typography variant="body2" className="mb-1">
          {label} <span className="text-mono-100 text-xs">(String)</span>
        </Typography>

        <Input
          id={path}
          isControlled
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          placeholder="Enter text"
        />
      </div>
    );
  }

  if (kind === BlueprintFieldKind.Bytes) {
    return (
      <div className="py-1">
        <Typography variant="body2" className="mb-1">
          {label} <span className="text-mono-100 text-xs">(Bytes, hex)</span>
        </Typography>

        <Input
          id={path}
          isControlled
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          placeholder="0x..."
        />
      </div>
    );
  }

  if (kind === BlueprintFieldKind.Optional) {
    const optVal = (value as { present: boolean; inner?: FormFieldValue }) ?? {
      present: false,
    };
    const childSchema = field.children[0];

    return (
      <div className="py-1 pl-3 border-l-2 border-mono-60 dark:border-mono-140">
        <div className="flex items-center gap-2 mb-1">
          <CheckBox
            isChecked={optVal.present}
            onChange={() => {
              if (optVal.present) {
                onChange({ present: false });
              } else {
                onChange({
                  present: true,
                  inner: childSchema ? getDefaultValue(childSchema) : null,
                });
              }
            }}
          />

          <Typography variant="body2">
            {label} <span className="text-mono-100 text-xs">(Optional)</span>
          </Typography>
        </div>

        {optVal.present && childSchema && (
          <SchemaFieldInput
            field={childSchema}
            value={optVal.inner ?? null}
            onChange={(inner) => onChange({ present: true, inner })}
            path={`${path}.value`}
          />
        )}
      </div>
    );
  }

  if (kind === BlueprintFieldKind.Array) {
    return (
      <ArrayFieldInput
        field={field}
        value={value}
        onChange={onChange}
        path={path}
        label={label}
      />
    );
  }

  if (kind === BlueprintFieldKind.List) {
    return (
      <ListFieldInput
        field={field}
        value={value}
        onChange={onChange}
        path={path}
        label={label}
      />
    );
  }

  if (kind === BlueprintFieldKind.Struct) {
    return (
      <StructFieldInput
        field={field}
        value={value}
        onChange={onChange}
        path={path}
        label={label}
      />
    );
  }

  return (
    <div className="py-1">
      <Typography variant="body2" className="text-yellow-400">
        Unsupported field kind: {kindLabel(kind)}
      </Typography>
    </div>
  );
};

const EMPTY_ARRAY: FormFieldValue[] = [];

const ArrayFieldInput: FC<SchemaFieldInputProps & { label: string }> = ({
  field,
  value,
  onChange,
  path,
  label,
}) => {
  const childSchema = field.children[0];
  const elements = useMemo(
    () => (Array.isArray(value) ? (value as FormFieldValue[]) : EMPTY_ARRAY),
    [value],
  );

  const handleElementChange = useCallback(
    (index: number, newVal: FormFieldValue) => {
      const updated = [...elements];
      updated[index] = newVal;
      onChange(updated);
    },
    [elements, onChange],
  );

  if (!childSchema) {
    return null;
  }

  return (
    <div className="py-1 pl-3 border-l-2 border-mono-60 dark:border-mono-140">
      <Typography variant="body2" className="mb-1">
        {label}{' '}
        <span className="text-mono-100 text-xs">
          (Array[{field.arrayLength}])
        </span>
      </Typography>

      {Array.from({ length: field.arrayLength }, (_, i) => (
        <SchemaFieldInput
          key={i}
          field={childSchema}
          value={elements[i] ?? getDefaultValue(childSchema)}
          onChange={(v) => handleElementChange(i, v)}
          path={`${path}[${i}]`}
        />
      ))}
    </div>
  );
};

const ListFieldInput: FC<SchemaFieldInputProps & { label: string }> = ({
  field,
  value,
  onChange,
  path,
  label,
}) => {
  const childSchema = field.children[0];
  const elements = useMemo(
    () => (Array.isArray(value) ? (value as FormFieldValue[]) : EMPTY_ARRAY),
    [value],
  );

  const handleAdd = useCallback(() => {
    if (!childSchema) {
      return;
    }
    onChange([...elements, getDefaultValue(childSchema)]);
  }, [childSchema, elements, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const updated = elements.filter((_, i) => i !== index);
      onChange(updated);
    },
    [elements, onChange],
  );

  const handleElementChange = useCallback(
    (index: number, newVal: FormFieldValue) => {
      const updated = [...elements];
      updated[index] = newVal;
      onChange(updated);
    },
    [elements, onChange],
  );

  if (!childSchema) {
    return null;
  }

  return (
    <div className="py-1 pl-3 border-l-2 border-mono-60 dark:border-mono-140">
      <Typography variant="body2" className="mb-1">
        {label}{' '}
        <span className="text-mono-100 text-xs">
          (List, {elements.length} items)
        </span>
      </Typography>

      {elements.map((el, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            <SchemaFieldInput
              field={childSchema}
              value={el}
              onChange={(v) => handleElementChange(i, v)}
              path={`${path}[${i}]`}
            />
          </div>

          <Button
            variant="utility"
            size="sm"
            className="mt-1 shrink-0"
            onClick={() => handleRemove(i)}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button variant="utility" size="sm" onClick={handleAdd} className="mt-1">
        + Add Item
      </Button>
    </div>
  );
};

const StructFieldInput: FC<SchemaFieldInputProps & { label: string }> = ({
  field,
  value,
  onChange,
  path,
  label,
}) => {
  const fieldValues = useMemo(
    () => (Array.isArray(value) ? (value as FormFieldValue[]) : EMPTY_ARRAY),
    [value],
  );

  const handleFieldChange = useCallback(
    (index: number, newVal: FormFieldValue) => {
      const updated = [...fieldValues];
      updated[index] = newVal;
      onChange(updated);
    },
    [fieldValues, onChange],
  );

  return (
    <div className="py-1 pl-3 border-l-2 border-mono-60 dark:border-mono-140">
      <Typography variant="body2" className="mb-1">
        {label} <span className="text-mono-100 text-xs">(Struct)</span>
      </Typography>

      {field.children.map((child, i) => (
        <SchemaFieldInput
          key={i}
          field={child}
          value={fieldValues[i] ?? getDefaultValue(child)}
          onChange={(v) => handleFieldChange(i, v)}
          path={`${path}.${child.name || i}`}
        />
      ))}
    </div>
  );
};

export default SchemaFieldInput;
