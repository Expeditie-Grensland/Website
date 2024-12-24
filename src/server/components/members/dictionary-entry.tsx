import { marked } from "marked";
import { FunctionComponent } from "preact";
import { MediaPlayer } from "../media/media-player.js";

export const DictionaryEntry: FunctionComponent<{
  id: string;
  term: string;
  smallTerm?: string | null;
  descriptions: string | string[];
  attachmentFile?: string | null;
}> = ({ id, term, smallTerm, attachmentFile, descriptions }) => (
  <>
    <div id={id} class="col-12 col-xl-9 pb-4">
      <div class="h2 pb-2">
        {term}
        {smallTerm && (
          <>
            {" "}
            <small class="text-muted">{smallTerm}</small>
          </>
        )}
      </div>

      {descriptions instanceof Array ? (
        <ol class="serif">
          {descriptions.map((description) => (
            <li
              class="pb-1"
              dangerouslySetInnerHTML={{
                __html: marked(description) as string,
              }}
            />
          ))}
        </ol>
      ) : (
        <span
          dangerouslySetInnerHTML={{
            __html: marked(descriptions) as string,
          }}
        />
      )}
    </div>

    {attachmentFile && (
      <div class="col-12 col-xl-3 pb-4">
        <MediaPlayer file={attachmentFile} />
      </div>
    )}
  </>
);
