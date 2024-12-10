import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";
import packageJson from "../../../../../package.json" with { type: "json" };
import { getMemberLinks } from "../../../db/member-link.js";
import { authenticatePerson } from "../../../db/person.js";
import { getUmamiConfig } from "../../../helpers/config.js";
import { HTMLAttributeAnchorTarget } from "preact/compat";

const LinkCard: FunctionComponent<{
  title: string;
  text: string;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  adminHref?: string | false;
}> = ({ title, text, href, target, adminHref }) => (
  <div class="col-12 col-md-6 col-lg-4">
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{title}</h5>
        <p class="card-text">{text}</p>
        {href && (
          <a class="card-link" href={href} target={target}>
            Open
          </a>
        )}
        {adminHref && (
          <a class="card-link" href={adminHref}>
            Admin
          </a>
        )}
      </div>
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

      <div class="row">
        <LinkCard
          title="Hoofdpagina"
          text="Alle Expedities (en verborgen videos)"
          href="/"
          adminHref={user.type == "admin" && "/?concepten=1"}
        />

        <LinkCard
          title="Woordenboek"
          text="Het Grote Woordenboek der Expediets"
          href="/leden/woordenboek"
          adminHref={user.type == "admin" && "/leden/admin/woordenboek"}
        />

        <LinkCard
          title="Citaten"
          text="De Lange Citatenlijst der Expeditie Grensland"
          href="/leden/citaten"
          adminHref={user.type == "admin" && "/leden/admin/citaten"}
        />

        <LinkCard
          title="Afkowobo"
          text="Het enige echte afkortingenwoordenboek der Expediets"
          href="/leden/afkowobo"
          adminHref={user.type == "admin" && "/leden/admin/afkowobo"}
        />

        <LinkCard
          title="De Punt'n"
          text="Welk team is het vurigst? Blauw, of Rood?"
          href="/leden/punten"
          adminHref={user.type == "admin" && "/leden/admin/punten"}
        />

        {user.type == "admin" && (
          <>
            <LinkCard
              title="GPX Upload"
              text="Omdat we nog steeds geen app hebben"
              adminHref="/leden/admin/gpx"
            />

            <LinkCard
              title="Verhaalelementen"
              text="Extra informatie op de kaart"
              adminHref="/ledne/admin/verhalen"
            />

            <LinkCard
              title="Bestanden"
              text="De Small Data"
              adminHref="/leden/admin/bestanden"
            />
          </>
        )}

        {getUmamiConfig()?.shareUrl && (
          <LinkCard
            title="Statistieken"
            text="Wie zijn onze fans?"
            href={getUmamiConfig()!.shareUrl!}
            target="_blank"
          />
        )}

        {memberLinks.map((link) => (
          <LinkCard
            title={link.title}
            text={link.description}
            href={link.url}
          />
        ))}
      </div>

      {user.type == "admin" && (
        <div class="row mt-3">
          <span class="members-very-light">Versie: {packageJson.version}</span>
        </div>
      )}
    </div>
  </Page>
);

export const renderMembersHomePage = (
  props: ComponentProps<typeof MembersHomePage>
) => render(<MembersHomePage {...props} />);
