import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthPage } from "./pages/Auth/AuthPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { AppealsPage } from "./pages/Appeals/AppealsPage";
import { CreateAppealPage } from "./pages/Appeals/CreateAppealPage";
import { AdminAppealsPage } from "./pages/Admin/AdminAppealsPage";
import { ProtectedRoute, OfficerRoute } from "./utils/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "appeals",
        element: (
          <ProtectedRoute>
            <AppealsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute>
            <CreateAppealPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <OfficerRoute>
            <AdminAppealsPage />
          </OfficerRoute>
        ),
      },
    ],
  },
]);
