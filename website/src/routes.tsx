import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Parents from "./pages/Parents";
import ResearchTool from "./pages/ResearchTool";
import FacilitySearch from "./pages/FacilitySearch";
import IepAnalyzer from "./pages/IepAnalyzer";
import Counselors from "./pages/Counselors";
import Districts from "./pages/Districts";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "parents", Component: Parents },
      { path: "parents/research", Component: ResearchTool },
      { path: "parents/facilities", Component: FacilitySearch },
      { path: "parents/iep", Component: IepAnalyzer },
      { path: "counselors", Component: Counselors },
      { path: "districts", Component: Districts },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
