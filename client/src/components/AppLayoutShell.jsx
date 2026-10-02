import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";

export const AppLayoutShell = ({ cartCount, fallback = null }) => (
  <AppLayout cartCount={cartCount}>
    <Suspense fallback={fallback}>
      <Outlet />
    </Suspense>
  </AppLayout>
);
