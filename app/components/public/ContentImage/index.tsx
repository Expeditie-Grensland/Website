import { Link } from "@remix-run/react";
import cx from "~/utils/classNames/cx";

type Props = {
  size?: "small" | "big";
  linkTo?: string;
  title: string;
  subtitle: string;
  src: string;
};

const ContentImage = ({
  size = "small",
  linkTo = "",
  title,
  subtitle,
  src,
}: Props) => {
  const content = (
    <div
      className={cx([
        "relative text-center shadow-important",
        size == "big" ? "md:aspect-[5/2] aspect-[20/17]" : "aspect-[20/13]",
        linkTo && "group hover:shadow-important-hover transition-all",
      ])}
    >
      <div
        className={cx([
          "absolute inset-0 bg-cover bg-center",
          linkTo && "group-hover:brightness-80 transition-all",
        ])}
        style={{ backgroundImage: `url(${src})` }}
      />
      <div className="p-[5%] bg-overlay absolute inset-0 top-auto text-shadow leading-tight">
        <span
          className={cx([
            "block text-[2rem]",
            size == "big" && "md:text-[3rem]",
          ])}
        >
          {title}
        </span>
        <span
          className={cx([
            "block text-[1.2rem]",
            size == "big" && "md:text-[1.6rem]",
          ])}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );

  return linkTo ? (
    <Link prefetch="intent" to={linkTo}>
      {content}
    </Link>
  ) : (
    content
  );
};

export default ContentImage;
