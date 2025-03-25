import { FunctionComponent } from "preact";
import {
  authenticatePerson,
  getAllPersonsWithAddresses,
} from "../../../db/person.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const AddresslistPage: FunctionComponent<{
  persons: Awaited<ReturnType<typeof getAllPersonsWithAddresses>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ persons, user }) => (
  <Page
    title="Expeditie - Adressenlijst"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <h1 class="page-title">Adressenlijst der Expeditieleden</h1>

      {persons
        .filter((person) => person.addresses.length > 0)
        .map((person) => (
          <div>
            <div class="addresslist-name">
              {person.first_name} {person.last_name}
            </div>

            <div class="grid-3">
              {person.addresses.map((address) => (
                <div>
                  {address.name && (
                    <div class="addresslist-subname">{address.name}</div>
                  )}
                  <div>{address.line_1}</div>
                  <div>{address.line_2}</div>
                  <div>{address.country}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  </Page>
);
