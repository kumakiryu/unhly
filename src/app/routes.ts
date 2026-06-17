import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { SplashScreen } from "./components/SplashScreen";
import { MembersPage } from "./components/MembersPage";
import { ProfilePage } from "./components/ProfilePage";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: "/", Component: SplashScreen },
      { path: "/members", Component: MembersPage },
      { path: "/:slug", Component: ProfilePage },
    ],
  },
]);
