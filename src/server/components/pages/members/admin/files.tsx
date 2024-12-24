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
    itemKey="file"
    columns={[
      {
        label: "Sleutel (prefix)",
        style: { minWidth: "25rem" },
        render: (file) => <div class="py-4">{file?.file}</div>,
      },

      {
        label: "Type",
        style: { minWidth: "15rem" },
        render: (file) => file && getFileTypeText(file.type),
      },

      {
        label: "Preview",
        style: { width: "10rem" },
        render: (file) =>
          file && (
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
          ),
      },

      {
        label: "In gebruik als",
        style: { minWidth: "20rem" },
        render: (file) =>
          file &&
          (file.uses ? (
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
          )),
      },
    ]}
  />
);

export const renderFilesAdminPage = (
  props: ComponentProps<typeof FilesAdminPage>
) => render(<FilesAdminPage {...props} />);
