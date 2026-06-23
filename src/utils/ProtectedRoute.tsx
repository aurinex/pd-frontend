import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

export const ProtectedRoute = ({ children }: any) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export const OfficerRoute = ({ children }: any) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const isOfficer = user.roles?.includes("officer") || user.roles?.includes("admin");

  if (!isOfficer) {
    return <Navigate to="/" />;
  }

  return children;
};
