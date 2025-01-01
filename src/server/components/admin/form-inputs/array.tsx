import { ComponentChildren } from "preact";

type FormInputArrayProps<Value> = {
  values?: Value[];
  allowEmpty?: boolean;

  children: (
    value: Value | undefined,

    inputAttributes: { disabled?: boolean; form?: string }
  ) => ComponentChildren;

  form?: string;
};

export const FormInputArray = <Value,>({
  values = [],
  allowEmpty,
  children,
  ...attrs
}: FormInputArrayProps<Value>) => (
  <div class={allowEmpty ? "form-array form-array-allow-empty" : "form-array"}>
    {(values.length == 0 && !allowEmpty ? [undefined] : values).map((value) => (
      <div class="form-array-item">{children(value, attrs)}</div>
    ))}

    <div class="form-array-proto" hidden>
      {children(undefined, { disabled: true, ...attrs })}
    </div>

    <button class="form-array-add btn btn-secondary me-2">+</button>
    <button
      class="form-array-remove btn btn-secondary"
      disabled={values.length == 0 || (!allowEmpty && values.length == 1)}
    >
      –
    </button>
  </div>
);
