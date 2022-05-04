import { Link, useMatches } from "@remix-run/react";
import type { Person } from "~/generated/db";

type Props = {
  user: Person | undefined;
};

const PublicNavBar = ({ user }: Props) => {
  const linkMatch = useMatches().find(({ handle }) => handle?.backLink);
  const link = linkMatch && linkMatch.handle.backLink(linkMatch.data);

  return (
    <div className="container mx-auto my-5 flex">
      {link && (
        <Link
          className="text-p-gray hover:text-p-lgray focus:text-light-gray transition-all flex-none"
          to={link.to}
          prefetch="render"
        >
          {link.text}
        </Link>
      )}
      <Link
        className="text-p-gray hover:text-p-lgray focus:text-p-lgray transition-all flex-none ml-auto"
        to={user ? "/leden" : "/login"}
        prefetch="intent"
      >
        {user ? `${user.firstName} ${user.lastName}` : "Log In"}
      </Link>
    </div>
  );
};

export default PublicNavBar;
