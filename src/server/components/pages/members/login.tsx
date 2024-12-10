import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const LoginPage: FunctionComponent<{
  messages: string[];
}> = ({ messages }) => (
  <Page
    title="Expeditie - Log In"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="no-user" backTo="home" />

      <div class="row">
        <div class="col-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Inloggen</h4>
              <hr />
              {messages?.map((message) => (
                <p class="text-danger text-center">{message}</p>
              ))}

              <form
                action="/leden/login"
                method="POST"
                onSubmit="window.umami?.track('login', { gebruiker: document.getElementById('username').value.toLowerCase() })"
              >
                <div class="form-group mb-2">
                  <input
                    class="form-control"
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Gebruikersnaam"
                    required
                    autoFocus
                  />
                </div>

                <div class="form-group mb-2">
                  <input
                    class="form-control"
                    type="password"
                    name="password"
                    placeholder="Wachtwoord"
                    required
                  />
                </div>

                <div class="form-group">
                  <input
                    class="btn btn-primary btn-block"
                    value="Log In"
                    type="submit"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Page>
);

export const renderLoginPage = (props: ComponentProps<typeof LoginPage>) =>
  render(<LoginPage {...props} />);
