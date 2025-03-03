import { Selectable } from "kysely";
import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { HTMLAttributeAnchorTarget } from "preact/compat";
import packageJson from "../../../../../package.json" with { type: "json" };
import { getMemberLinks } from "../../../db/member-link.js";
import { getMemberWritingsList } from "../../../db/member-writings.js";
import { authenticatePerson } from "../../../db/person.js";
import { Expeditie } from "../../../db/schema/types.js";
import { formatDateRange } from "../../../helpers/time.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const LinkCard: FunctionComponent<{
  title: string;
  text: string;
  links: {
    text?: string;
    url: string;
    target?: HTMLAttributeAnchorTarget;
    when?: boolean;
  }[];
}> = ({ title, text, links }) =>
  links.filter((link) => link.when !== false).length > 0 && (
    <div class="link-card">
      <h2 class="link-card-title">{title}</h2>
      <p class="link-card-text">{text}</p>
      <div class="link-card-links">
        {links
          .filter((link) => link.when !== false)
          .map(({ text: linkText = "Open", url, target }) => (
            <a href={url} target={target}>
              {linkText}
            </a>
          ))}
      </div>
    </div>
  );

const MembersHomePage: FunctionComponent<{
  memberLinks: Awaited<ReturnType<typeof getMemberLinks>>;
  memberWritings: Awaited<ReturnType<typeof getMemberWritingsList>>;
  currentExpedities: Selectable<Expeditie>[];
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ memberLinks, memberWritings, currentExpedities, user }) => (
  <Page
    title="Expeditie - Leden"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" user={user} />

      <div class="grid-3">
        <LinkCard
          title="Hoofdpagina"
          text="Alle Expedities (en verborgen videos)"
          links={[
            { url: "/" },
            {
              text: "Inclusief concepten",
              url: "/?concepten=1",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Woordenboek"
          text="Het Grote Woordenboek der Expediets"
          links={[
            { url: "/leden/woordenboek" },
            {
              text: "Admin",
              url: "/leden/admin/woordenboek",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Citaten"
          text="De Lange Citatenlijst der Expeditie Grensland"
          links={[
            { url: "/leden/citaten" },
            {
              text: "Admin",
              url: "/leden/admin/citaten",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Afkowobo"
          text="Het enige echte afkortingenwoordenboek der Expediets"
          links={[
            { url: "/leden/afkowobo" },
            {
              text: "Admin",
              url: "/leden/admin/afkowobo",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="De Punt'n"
          text="Welk team is het vurigst? Blauw, of Rood?"
          links={[
            { url: "/leden/punten" },
            {
              text: "Admin",
              url: "/leden/admin/punten",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Expedities"
          text="Voor als we weer op pad gaan"
          links={[
            {
              text: "Admin",
              url: "/leden/admin/expedities",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Personen"
          text="Leden der Expeditie"
          links={[
            {
              text: "Adressen",
              url: "/leden/adressenlijst",
            },
            {
              text: "Admin",
              url: "/leden/admin/personen",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Bestanden"
          text="De Small Data"
          links={[
            {
              text: "Admin",
              url: "/leden/admin/bestanden",
              when: user.type == "admin",
            },
          ]}
        />
      </div>

      {user.type == "admin" && currentExpedities.length > 0 && (
        <>
          <h1 class="link-category">Lopende expedities</h1>

          <div class="grid-3">
            {currentExpedities.map((exp) => (
              <LinkCard
                title={exp.name}
                text={formatDateRange(exp.start_date, exp.end_date)}
                links={[
                  {
                    text: "GPX Upload",
                    url: `/leden/admin/expedities/${exp.id}/gpx`,
                  },
                  {
                    text: "Segmenten",
                    url: `/leden/admin/expedities/${exp.id}/segmenten`,
                  },
                  {
                    text: "Verhalen",
                    url: `/leden/admin/expedities/${exp.id}/verhalen`,
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}

      {memberWritings.length > 0 && (
        <>
          <h1 class="link-category">Geschriften</h1>

          <div class="grid-3">
            {memberWritings.map((writing) => (
              <LinkCard
                title={writing.title}
                text={writing.description}
                links={[
                  {
                    text: "Open",
                    url: `/leden/geschriften/${writing.id}`,
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}

      {memberLinks.length > 0 && (
        <>
          <h1 class="link-category">Externe links</h1>

          <div class="grid-3">
            {memberLinks.map((link) => (
              <LinkCard
                title={link.title}
                text={link.description}
                links={[
                  {
                    text: "Open",
                    url: link.url,
                    target: "_blank",
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}

      {user.type == "admin" && (
        <div class="version-text">Versie: {packageJson.version}</div>
      )}
    </div>
  </Page>
);

export const renderMembersHomePage = (
  props: ComponentProps<typeof MembersHomePage>
) => render(<MembersHomePage {...props} />);
