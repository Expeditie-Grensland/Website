import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../../db/person.js";
import { getFileUrl } from "../../../../files/files.js";
import { getUsesForFiles } from "../../../../files/uses.js";
import { AdminPage } from "../../../admin/admin-page.js";

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
  <AdminPage
    title="Bestanden Admin"
    user={user}
    messages={messages}
    items={filesWithUses}
    columns={[
      {
        label: "Sleutel (prefix)",
        style: { minWidth: "25rem" },
        render: (file) => file?.file,
      },

      {
        label: "Type",
        style: { minWidth: "15rem" },
        render: (file) => file && getFileTypeText(file.type),
      },

      {
        label: "Preview",
        style: { minWidth: "10rem", maxWidth: "10rem" },
        render: (file) =>
          file && (
            <a class="file-preview" href={getFileMainUrl(file.file, file.type)}>
              {getFileImagePreviewUrl(file.file, file.type) ? (
                <img
                  src={getFileImagePreviewUrl(file.file, file.type)}
                  alt="Preview"
                />
              ) : (
                "Link"
              )}
            </a>
          ),
      },

      {
        label: "In gebruik als",
        style: { minWidth: "20rem" },
        render: (file) =>
          file &&
          (file.uses ? (
            file.uses.map((use) => <p>{getUseTypeText(use.type, use.name)}</p>)
          ) : (
            <form
              method="POST"
              data-confirm-msg={`Weet je zeker dat je het bestand "${file.file}" definitief wilt verwijderen?`}
            >
              <button
                class="button-danger"
                type="submit"
                formAction={`/leden/admin/bestanden/delete/${file.file}`}
              >
                Verwijderen
              </button>
            </form>
          )),
      },
    ]}
  />
);

export const renderFilesAdminPage = (
  props: ComponentProps<typeof FilesAdminPage>
) => render(<FilesAdminPage {...props} />);
