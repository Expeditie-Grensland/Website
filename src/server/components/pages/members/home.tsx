import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { HTMLAttributeAnchorTarget } from "preact/compat";
import packageJson from "../../../../../package.json" with { type: "json" };
import { getMemberLinks } from "../../../db/member-link.js";
import { authenticatePerson } from "../../../db/person.js";
import { getUmamiConfig } from "../../../helpers/config.js";
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
      <h1>{title}</h1>
      <p>{text}</p>
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
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ memberLinks, user }) => (
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
          title="GPX Upload"
          text="Omdat we nog steeds geen app hebben"
          links={[
            {
              text: "Admin",
              url: "/leden/admin/gpx",
              when: user.type == "admin",
            },
          ]}
        />

        <LinkCard
          title="Verhaalelementen"
          text="Extra informatie op de kaart"
          links={[
            {
              text: "Admin",
              url: "/leden/admin/verhalen",
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

        <LinkCard
          title="Statistieken"
          text="Wie zijn onze fans?"
          links={[
            {
              text: "Open",
              url: getUmamiConfig()?.shareUrl as string,
              when: !!getUmamiConfig()?.shareUrl,
              target: "_blank",
            },
          ]}
        />

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

      {user.type == "admin" && (
        <div class="version-text">Versie: {packageJson.version}</div>
      )}
    </div>
  </Page>
);

export const renderMembersHomePage = (
  props: ComponentProps<typeof MembersHomePage>
) => render(<MembersHomePage {...props} />);
