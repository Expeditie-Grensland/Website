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
    style?: "main" | "danger";
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

      <h1 class="page-title">{title}</h1>

      {messages["error"]?.map((msg) => <div class="message-error">{msg}</div>)}
      {messages["info"]?.map((msg) => <div class="message-info">{msg}</div>)}

      {newAction && (
        <form
          class="admin-new-form"
          action={newAction.action}
          method="POST"
          encType={multipart ? "multipart/form-data" : undefined}
        >
          {columns.map((column) => (
            <div class="inputs-with-label">
              <label>{column.label}</label>
              {column.render(undefined, {})}
            </div>
          ))}

          <button class="button-main" type="submit">
            {newAction.label || "Toevoegen"}
          </button>
        </form>
      )}

      {items && (
        <table class="admin-items-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th style={column.style}>{column.label}</th>
              ))}

              {actions && <th />}
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr>
                {columns.map((column) => (
                  <td>
                    <div class="table-inputs">
                      {column.render(item, { form: `form-${i}` })}
                    </div>
                  </td>
                ))}

                {actions && (
                  <td>
                    <form class="form-confirm" id={`form-${i}`} method="POST">
                      {actions.map((action) => (
                        <button
                          class={`${action.style == "danger" ? "button-danger" : "button-main"}`}
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
      )}
    </div>
  </Page>
);