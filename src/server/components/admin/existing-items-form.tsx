import { ComponentChildren } from "preact";
import { JSX } from "preact/jsx-runtime";

export type ExistingItemsFormProps<Value> = {
  items: Value[];
  itemKey: keyof Value;

  columns: {
    label: string;
    style?: JSX.CSSProperties;

    render: (
      item: Value | undefined,
      inputAttributes: { form?: string }
    ) => ComponentChildren;
  }[];

  actions?: {
    label: string;
    action: (item: Value) => string;
    style?: "primary" | "danger";
  }[];
};

export const ExistingItemsForm = <Value,>({
  items,
  itemKey,
  columns,
  actions,
}: ExistingItemsFormProps<Value>) => (
  <table class="table table-sticky-header">
    <thead>
      <tr>
        {columns.map((column) => (
          <th style={column.style}>{column.label}</th>
        ))}

        {actions && <th />}
      </tr>
    </thead>

    <tbody>
      {items.map((item) => (
        <tr>
          {columns.map((column) => (
            <td>
              {column.render(item, {
                form: `form-${item[itemKey]}`,
              })}
            </td>
          ))}

          {actions && (
            <td>
              <form
                class="form-confirm"
                id={`form-${item[itemKey]}`}
                method="POST"
              >
                {actions.map((action) => (
                  <button
                    class={`btn d-block ${action.style == "danger" ? "btn-danger" : "btn-primary"}`}
                    type="submit"
                    formAction={action.action(item)}
                  >
                    {action.label}
                  </button>
                ))}
              </form>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);
