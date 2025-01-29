import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../../db/person.js";
import { getAllQuotes } from "../../../../db/quote.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  LocalTimeInput,
  TextAreaInput,
  TextInput,
  TimezoneInput,
} from "../../../admin/form-inputs.js";

const QuotesAdminPage: FunctionComponent<{
  quotes: Awaited<ReturnType<typeof getAllQuotes>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ quotes, user, messages }) => (
  <AdminPage
    title="Citaten Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/citaten/add" }}
    items={quotes}
    columns={[
      {
        label: "Id",
        style: { minWidth: "15rem" },
        render: (quote, attrs) => (
          <TextInput
            name="id"
            placeholder="Id"
            required
            value={quote?.id}
            {...attrs}
          />
        ),
      },

      {
        label: "Quote",
        style: { minWidth: "20rem" },
        render: (quote, attrs) => (
          <TextAreaInput
            name="quote"
            placeholder="Citaat"
            required
            value={quote?.quote}
            {...attrs}
          />
        ),
      },

      {
        label: "Context",
        style: { minWidth: "30rem", width: "100%" },
        render: (quote, attrs) => (
          <TextAreaInput
            name="context"
            placeholder="Context"
            required
            value={quote?.context}
            {...attrs}
          />
        ),
      },

      {
        label: "Persoon",
        style: { minWidth: "15rem" },
        render: (quote, attrs) => (
          <TextInput
            name="quotee"
            placeholder="Persoon"
            required
            value={quote?.quotee}
            {...attrs}
          />
        ),
      },

      {
        label: "Lokale tijd en tijdzone",
        style: { minWidth: "12.5rem" },
        render: (quote, attrs) => (
          <>
            <LocalTimeInput
              name="time_local"
              required
              value={
                quote && { stamp: quote.time_stamp, zone: quote.time_zone }
              }
              {...attrs}
            />
            <TimezoneInput
              name="time_zone"
              required
              value={quote?.time_zone}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Bijlage",
        style: { minWidth: "17.5rem" },
        render: (quote, attrs) => (
          <TextInput
            name="attachment_file"
            placeholder="Bijlage"
            value={quote?.attachment_file || undefined}
            {...attrs}
          />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (quote) => `/leden/admin/citaten/update/${quote.id}`,
        confirmMessage: (quote) =>
          `Weet je zeker dat je het citaat "${quote.quote}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (quote) => `/leden/admin/citaten/delete/${quote.id}`,
        confirmMessage: (quote) =>
          `Weet je zeker dat je het citaat "${quote.quote}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);

export const renderQuotesAdminPage = (
  props: ComponentProps<typeof QuotesAdminPage>
) => render(<QuotesAdminPage {...props} />);
