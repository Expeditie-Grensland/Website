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
            media="(max-width: 650px)"
            type="image/webp"
          />

          <source
            srcset={getFileUrl(file, "klein.jpg")}
            media="(max-width: 650px)"
            type="image/jpeg"
          />

          <source srcset={getFileUrl(file, "normaal.webp")} type="image/webp" />

          <img
            class="img-bg"
            src={getFileUrl(file, "normaal.jpg")}
            draggable={false}
          />
        </>
      )}

      {size == "small" && (
        <>
          <source srcset={getFileUrl(file, "klein.webp")} type="image/webp" />

          <img
            class="img-bg"
            src={getFileUrl(file, "klein.jpg")}
            draggable={false}
          />
        </>
      )}
    </picture>
  );

  const titles = (
    <div class="img-inner">
      <span class="h1">{title}</span>
      {subtitle && <span class="h2">{subtitle}</span>}
    </div>
  );

  return link ? (
    <a
      class={`${size == "large" ? "img-large" : "img-small"} ratio`}
      href={link}
      draggable={false}
      style={{ backgroundColor: colour }}
    >
      {picture}
      {titles}
    </a>
  ) : (
    <div
      class={`${size == "large" ? "img-large" : "img-small"} ratio`}
      style={{ backgroundColor: colour }}
    >
      {picture}
      {titles}
    </div>
  );
};
