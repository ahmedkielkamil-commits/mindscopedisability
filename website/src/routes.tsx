import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Parents from "./pages/Parents";
import ResearchTool from "./pages/ResearchTool";
import IepAnalyzer from "./pages/IepAnalyzer";
import Counselors from "./pages/Counselors";
import Districts from "./pages/Districts";
import About from "./pages/About";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "parents", Component: Parents },
      { path: "parents/research", Component: ResearchTool },
      { path: "parents/facilities", element: <Navigate to="/parents" replace /> },
      { path: "parents/iep", Component: IepAnalyzer },
      { path: "counselors", Component: Counselors },
      { path: "districts", Component: Districts },
      { path: "about", Component: About },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
