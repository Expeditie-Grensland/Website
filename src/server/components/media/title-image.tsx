import { FunctionComponent } from "preact";
import { getFileUrl } from "../../files/files.js";

export const TitleImage: FunctionComponent<{
  size: "large" | "small";
  file?: string | null;
  colour?: string | null;
  title: string;
  subtitle?: string | null;
  link?: string | null;
}> = ({ size, file, colour, title, subtitle, link }) => {
  const picture = file && (
    <picture>
      {size == "large" && (
        <>
          <source
            srcset={getFileUrl(file, "klein.webp")}
            media="(max-width: 500px)"
            type="image/webp"
          />

          <source
            srcset={getFileUrl(file, "klein.jpg")}
            media="(max-width: 500px)"
            type="image/jpeg"
          />

          <source srcset={getFileUrl(file, "normaal.webp")} type="image/webp" />

          <img
            class="titleimg-bg"
            src={getFileUrl(file, "normaal.jpg")}
            draggable={false}
          />
        </>
      )}

      {size == "small" && (
        <>
          <source srcset={getFileUrl(file, "klein.webp")} type="image/webp" />

          <img
            class="titleimg-bg"
            src={getFileUrl(file, "klein.jpg")}
            draggable={false}
          />
        </>
      )}
    </picture>
  );

  const titles = (
    <div class="titleimg-text">
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  );

  const props = {
    class: `titleimg ${size == "large" ? "titleimg-large" : "titleimg-small"}`,
    style: { backgroundColor: colour },
  };

  return link ? (
    <a href={link} draggable={false} {...props}>
      {picture}
      {titles}
    </a>
  ) : (
    <div {...props}>
      {picture}
      {titles}
    </div>
  );
};
