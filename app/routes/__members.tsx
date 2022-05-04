import { Outlet } from "@remix-run/react";

const handle = {
  bodyClasses: "bg-m-back text-m-text min-h-screen",
};

const MembersPageHolder = () => {
  return <Outlet />;
};

export { handle };
export default MembersPageHolder;
