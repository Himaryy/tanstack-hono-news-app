import * as React from "react";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { userQueryOption } from "@/lib/api";

export const Route = createFileRoute("/_auth")({
  component: () => <Outlet />,
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOption());

    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
});
