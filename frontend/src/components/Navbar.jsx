import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Droplet, Bell } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNotificationStore } from "../stores/useNotificationStore";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { notifications, getNotifications } = useNotificationStore();
  const isAdmin = user?.user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const links = [
    ...(!isAdmin ? [{ to: "/home", label: "Home" }, { to: "/bankrequest", label: "Blood banks" }] : []),
    { to: "/messagepage", label: "Messages" },
    { to: "/profile", label: "Profile" },
    ...(isAdmin ? [{ to: "/adminpage", label: "Admin panel" }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `btn btn-sm md:btn-md w-full md:w-auto ${isActive ? "btn-primary" : "btn-ghost"}`;

  return (
    <header className="sticky top-0 z-[1000] bg-base-100/95 backdrop-blur border-b border-base-300">
      <nav className="navbar max-w-7xl mx-auto px-4" aria-label="Main">
        <div className="flex-1">
          <NavLink to={isAdmin ? "/adminpage" : "/home"} className="flex items-center gap-2 text-xl font-bold text-primary">
            <Droplet className="fill-primary" size={26} aria-hidden="true" />
            Save Lives
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/profile" state={{ tab: "notifications" }} className="btn btn-ghost btn-circle relative" aria-label={`Notifications, ${unread} unread`}>
            <Bell size={20} />
            {unread > 0 && <span className="badge badge-primary badge-xs absolute top-1 right-1">{unread}</span>}
          </NavLink>
          <button onClick={handleLogout} className="btn btn-outline btn-sm md:btn-md ml-2">
            Log out
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="btn btn-ghost md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X /> : <Menu />}
          {!menuOpen && unread > 0 && <span className="badge badge-primary badge-xs">{unread}</span>}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-2 px-4 pb-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="btn btn-outline w-full">
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
