import { Link, useMatches } from "@remix-run/react";
import cx from "~/utils/classNames/cx";
import type { Person } from "~/generated/db";

type Props = {
  type: "public" | "member";
  user: Person | undefined;
};

const NavBar = ({ type, user }: Props) => {
  const linkMatch = useMatches().find(({ handle }) => handle?.backLink);
  const link = linkMatch && linkMatch.handle.backLink(linkMatch.data);

  return (
    <div className="container mx-auto py-6 space-x-3 flex">
      <div className="flex-auto">
        {link && (
          <Link
            className={cx([
              "flex-none",
              type === "public" && "text-p-gray hover:text-p-lgray",
              type === "member" && "text-black",
            ])}
            to={link.to}
            prefetch="render"
          >
            {link.text}
          </Link>
        )}
      </div>
      {type === "public" && (
        <Link
          className="text-p-gray hover:text-p-lgray flex-none"
          to={user ? "/leden" : "/login"}
          prefetch="intent"
        >
          {user ? `${user.firstName} ${user.lastName}` : "Log In"}
        </Link>
      )}
      {type === "member" && (
        <>
          <div className="text-m-lgray flex-none">
            {`${user!.firstName} ${user!.lastName}`}
          </div>
          <Link
            className="text-m-gray hover:text-m-dgray flex-none"
            to="/loguit"
          >
            Log Uit
          </Link>
        </>
      )}
    </div>
  );
};

export default NavBar;
