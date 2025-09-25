import { marked } from "marked";
import type { FunctionComponent } from "preact";
import { MediaPlayer } from "../media/media-player.js";

export const DictionaryEntry: FunctionComponent<{
  id: string;
  term: string;
  smallTerm?: string | null;
  descriptions: string | string[];
  attachmentFile?: string | null;
}> = ({ id, term, smallTerm, attachmentFile, descriptions }) => (
  <>
    <div id={id} class="dict-entry">
      <div class="dict-text">
        <span class="dict-term">{term}</span>
        {smallTerm && (
          <>
            {" "}
            <span class="dict-small">{smallTerm}</span>
          </>
        )}

        <div class="dict-term"></div>
        {Array.isArray(descriptions) ? (
          <ol>
            {descriptions.map((description) => (
              <li
                // biome-ignore lint/security/noDangerouslySetInnerHtml: rendering markdown
                dangerouslySetInnerHTML={{
                  __html: marked.parseInline(description, {
                    async: false,
                    gfm: true,
                    breaks: true,
                  }),
                }}
              />
            ))}
          </ol>
        ) : (
          <p
            // biome-ignore lint/security/noDangerouslySetInnerHtml: rendering markdown
            dangerouslySetInnerHTML={{
              __html: marked.parseInline(descriptions, {
                async: false,
                gfm: true,
                breaks: true,
              }),
            }}
          />
        )}
      </div>

      {attachmentFile && (
        <div class="dict-media">
          <MediaPlayer file={attachmentFile} />
        </div>
      )}
    </div>
  </>
);
