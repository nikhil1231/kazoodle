import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";

import { AdminPage } from "./pages/AdminPage";
import { MainPage } from "./pages/MainPage";

const router = createHashRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
