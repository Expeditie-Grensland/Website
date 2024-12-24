import { ComponentChildren } from "preact";
import { JSX } from "preact/jsx-runtime";
import { authenticatePerson } from "../../db/person.js";
import { NavigationBar } from "../page-structure/navigation-bar.js";
import { Page } from "../page-structure/page.js";
import { ExistingItemsForm } from "./existing-items-form.js";
import { InfoMessages } from "./info-messages.js";
import { NewItemForm } from "./new-item-form.js";

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

        <InfoMessages messages={messages} />

        {newAction && (
          <div class="col-12 mb-4">
            <NewItemForm
              action={newAction.action}
              buttonText={newAction.label}
              multipart={multipart}
            >
              {columns.map((column) => column.render(undefined, {}))}
            </NewItemForm>
          </div>
        )}

        {items && itemKey && (
          <div class="col-12 mb-4">
            <ExistingItemsForm
              items={items}
              itemKey={itemKey}
              columns={columns}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  </Page>
);
