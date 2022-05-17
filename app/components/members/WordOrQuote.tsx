import { Link } from "@remix-run/react";
import Markdown from "marked-react";
import textToSlug from "~/utils/text/textToSlug";

const mdRenderer = {
  link: (origHref: string, text: string[]) => {
    let href = origHref;

    if (origHref === "w") {
      href = `/leden/woordenboek#${textToSlug(text[0])}`;
    } else if (origHref && origHref.startsWith("w:")) {
      href = `/leden/woordenboek#${textToSlug(href)}`;
    }

    return (
      <Link
        key=""
        className="text-m-blue hover:text-m-dblue hover:underline"
        to={href}
      >
        {text}
      </Link>
    );
  },
};

type Props = {
  title: string;
  titleExtra?: string;
  content: string | string[];
  attachment?: {
    type: "video" | "audio";
    mime: string;
    url: string;
  };
};

const WordOrQuote = ({ title, titleExtra, content, attachment }: Props) => (
  <div
    id={textToSlug(title)}
    className="my-10 flex flex-wrap xl:flex-nowrap gap-x-5"
  >
    <div className="flex-none w-full xl:w-3/4">
      <div className="mb-2">
        <h2 className="inline text-2xl">{title}</h2>
        {titleExtra && (
          <span className="text-m-gray text-lg ml-3">{titleExtra}</span>
        )}
      </div>

      {typeof content === "string" ? (
        <Markdown renderer={mdRenderer} value={content} />
      ) : (
        <ol className="list-decimal list-outside pl-10 marker:text-m-gray">
          {content.map((item, index) => (
            <li key={index} className="mb-1">
              <Markdown renderer={mdRenderer} value={item} />
            </li>
          ))}
        </ol>
      )}
    </div>

    {attachment && (
      <div className="flex-auto mt-5 xl:mt-0">
        {attachment.type === "video" && (
          <video
            className="w-full max-w-md aspect-video"
            controls
            preload="none"
          >
            <source src={attachment.url} type={attachment.mime} />
          </video>
        )}

        {attachment.type === "audio" && (
          <audio className="w-full max-w-md" controls preload="none">
            <source src={attachment.url} type={attachment.mime} />
          </audio>
        )}
      </div>
    )}
  </div>
);

export default WordOrQuote;
