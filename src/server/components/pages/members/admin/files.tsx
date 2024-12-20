import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../../db/person.js";
import { getFileUrl } from "../../../../files/files.js";
import { getUsesForFiles } from "../../../../files/uses.js";
import { InfoMessages } from "../../../admin/info-messages.js";
import { NavigationBar } from "../../../page-structure/navigation-bar.js";
import { Page } from "../../../page-structure/page.js";

const getFileTypeText = (type: string) => {
  switch (type) {
    case "film-dash":
      return "Film in DASH-formaat";
    case "afbeelding":
      return "Afbeelding";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    default:
      return `Onbekend (${type})`;
  }
};

const getFileMainUrl = (file: string, type: string) => {
  switch (type) {
    case "film-dash":
      return getFileUrl(file, "720p30.mp4");
    case "afbeelding":
      return getFileUrl(file, "normaal.jpg");
    case "video":
      return getFileUrl(file, "1080p30.mp4");
    case "audio":
      return getFileUrl(file, "audio.mp4");
    default:
      return getFileUrl(file);
  }
};

const getFileImagePreviewUrl = (file: string, type: string) => {
  switch (type) {
    case "film-dash":
      return getFileUrl(file, "poster.jpg");
    case "afbeelding":
      return getFileUrl(file, "klein.jpg");
    case "video":
      return getFileUrl(file, "poster.jpg");
    default:
      return "";
  }
};

const getUseTypeText = (use: string, detail: string) => {
  switch (use) {
    case "expeditie/background":
      return `Achtergrond voor expeditie ${detail}`;
    case "expeditie/movie":
      return `Film voor expeditie ${detail}`;
    case "word/attachment":
      return `Bijlage voor woord '${detail}'`;
    case "quote/attachment":
      return `Bijlage voor citaat '${detail}'`;
    case "story/media":
      return `Verhaal bij expeditie ${detail}`;
    default:
      return "Onbekend";
  }
};

const FilesAdminPage: FunctionComponent<{
  filesWithUses: Awaited<ReturnType<typeof getUsesForFiles>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ filesWithUses, user, messages }) => (
  <Page
    title="Expeditie - Bestanden Admin"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">Bestanden Admin</div>
        </div>

        <InfoMessages messages={messages} />

        <div class="col-12 mb-4">
          <hr />
          <div class="h2 mb-3">Lijst van bestanden op S3</div>

          <table class="table table-sticky-header">
            <thead>
              <tr>
                <th style={{ minWidth: "25rem" }}>Sleutel (prefix)</th>
                <th style={{ minWidth: "15rem" }}>Type</th>
                <th style={{ width: "10rem" }}>Preview</th>
                <th style={{ minWidth: "20rem" }}>In gebruik als</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filesWithUses.map((file) => (
                <tr>
                  <td class="py-4">{file.file}</td>
                  <td>{getFileTypeText(file.type)}</td>
                  <td>
                    <a href={getFileMainUrl(file.file, file.type)}>
                      {getFileImagePreviewUrl(file.file, file.type) ? (
                        <div style={{ width: "7.5rem", height: "5rem" }}>
                          <img
                            class="w-100 h-100 object-fit-cover"
                            src={getFileImagePreviewUrl(file.file, file.type)}
                            alt="Preview"
                          />
                        </div>
                      ) : (
                        "Link"
                      )}
                    </a>
                  </td>
                  <td>
                    {file.uses ? (
                      file.uses.map((use) => (
                        <p class="my-1">{getUseTypeText(use.type, use.name)}</p>
                      ))
                    ) : (
                      <form class="my-1 form-confirm" method="POST">
                        <button
                          class="btn btn-danger"
                          type="submit"
                          formAction={`/leden/admin/bestanden/delete/${file.file}`}
                        >
                          Verwijderen
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Page>
);

export const renderFilesAdminPage = (
  props: ComponentProps<typeof FilesAdminPage>
) => render(<FilesAdminPage {...props} />);
