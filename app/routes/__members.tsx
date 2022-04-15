import { Outlet } from "@remix-run/react";

const handle = {
  bodyClasses: "bg-white text-black-ish min-h-screen",
};

const MembersPageHolder = () => <Outlet />;

export { handle };
export default MembersPageHolder;
