import { Routes } from "@angular/router";
import { appTitle } from "./app.const";
import { AuthStore } from "src/app/auth/auth.store";
import { inject } from "@angular/core";

export const routes: Routes = [
  {
    path: "authentication",
    title: appTitle,
    canActivate: [() => inject(AuthStore).isNotSignedInGuard()],
    loadChildren: () => import("./auth/auth.routes"),
  },
  {
    path: "",
    title: appTitle,
    canActivate: [() => inject(AuthStore).isSignedInGuard()],
    loadChildren: () => import("./qa/qa.routes"),
  },
  {
    path: "**",
    canActivate: [
      () => {
        window.location.href = "/all-apps";
        return false;
      },
    ],
    loadComponent: () =>
      import("@shared/ui/component/not-found-route.component").then(
        (m) => m.NotFoundRouteComponent
      ),
  },
];
