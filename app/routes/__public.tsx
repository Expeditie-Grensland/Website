import { Outlet } from "@remix-run/react";

const handle = {
  bodyClasses: ["bg-back-gray", "text-white-ish", "min-h-screen"],
};

const PublicPageHolder = () => <Outlet />;

export { handle };
export default PublicPageHolder;
