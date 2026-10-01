import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
// Pages load on demand, so the login page (and first visit) stays fast.
const SignUp = lazy(() => import("./pages/SignUp"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Messages = lazy(() => import("./pages/Messages"));
const BankRequestPage = lazy(() => import("./pages/BankRequestPage"));
import Loading from "./components/Loading";
import { useAuthStore } from "./stores/useAuthStore";
import { useNotificationStore } from "./stores/useNotificationStore";
import { getSocket } from "./lib/socket";
import { homePath } from "./lib/routes";

/** Pages that need a login (and optionally the admin role). */
const RequireAuth = ({ children, admin = false }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  if (admin && user.user.role !== "admin") return <Navigate to="/home" replace />;
  return children;
};

/** Login/sign-up pages: signed-in users are sent straight in. */
const GuestOnly = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  return user ? <Navigate to={homePath(user)} replace /> : children;
};

/** Shows live notifications (e.g. "O+ blood is needed near you") as pop-ups. */
const LiveNotifications = () => {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  useEffect(() => {
    const socket = getSocket();
    if (!user || !socket) return undefined;
    const onNotification = (n) => {
      addNotification(n);
      toast(n.message, { icon: "🩸", duration: 6000 });
    };
    socket.on("notification:new", onNotification);
    return () => socket.off("notification:new", onNotification);
  }, [user, addNotification]);
  return null;
};

const App = () => {
  const { checkAuth, checkingAuth } = useAuthStore();

  // Check the session once when the site loads (not on every page change).
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <Loading />;

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <LiveNotifications />
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><SignUp /></GuestOnly>} />
        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/messagepage" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="/bankrequest" element={<RequireAuth><BankRequestPage /></RequireAuth>} />
        <Route path="/adminpage" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
