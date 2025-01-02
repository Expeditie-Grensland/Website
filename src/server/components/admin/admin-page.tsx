import { ComponentChildren } from "preact";
import { JSX } from "preact/jsx-runtime";
import { authenticatePerson } from "../../db/person.js";
import { NavigationBar } from "../page-structure/navigation-bar.js";
import { Page } from "../page-structure/page.js";

type AdminPageProps<Value> = {
  title: string;
  fluid?: boolean;

  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;

  newAction?: {
    label?: string;
    action: string;
  };

  multipart?: boolean;

  items?: Value[];
  itemKey?: keyof Value;

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

export const AdminPage = <Value,>({
  title,
  fluid,
  user,
  messages,
  newAction,
  multipart,
  items,
  itemKey,
  columns,
  actions,
}: AdminPageProps<Value>) => (
  <Page
    title={`Expeditie - ${title}`}
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class={fluid ? "container-fluid" : "container"}>
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">{title}</div>
        </div>

        {messages["error"]?.length || messages["info"]?.length ? (
          <div class="col-12 mb-4">
            {messages["error"]?.map((msg) => (
              <div class="alert alert-danger">{msg}</div>
            ))}
            {messages["info"]?.map((msg) => (
              <div class="alert alert-info">{msg}</div>
            ))}
          </div>
        ) : undefined}

        {newAction && (
          <div class="col-12 mb-4">
            <form
              action={newAction.action}
              method="POST"
              encType={multipart ? "multipart/form-data" : undefined}
            >
              {columns.map((column) => (
                <div class="col-12 col-md-4 mb-2 me-md-2">
                  <label class="small">{column.label}</label>
                  {column.render(undefined, {})}
                </div>
              ))}

              <div class="col-12 col-md-4 mb-2">
                <button class="btn btn-primary" type="submit">
                  {newAction.label || "Toevoegen"}
                </button>
              </div>
            </form>
          </div>
        )}

        {items && itemKey && (
          <div class="col-12 mb-4">
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
          </div>
        )}
      </div>
    </div>
  </Page>
);
