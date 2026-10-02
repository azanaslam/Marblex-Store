import { Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";

export const AppLayoutShell = ({ cartCount }) => (
  <AppLayout cartCount={cartCount}>
    <Outlet />
  </AppLayout>
);
