import { useEffect } from "react";
import { Navigate, Outlet } from "react-router"
import { useAuth } from "~/context/AuthContext";
import { dashboard_url } from "~/lib/navigation";

export default function AuthLayout() {
  const { session } = useAuth();

  useEffect(() => {
    console.log("LOGIN MOUNT");

    return () => {
      console.log("LOGIN UNMOUNT");
    };
  }, []);
  
  if (session) {
    return <Navigate to={dashboard_url} replace />
  }

  return <Outlet/>;
}
