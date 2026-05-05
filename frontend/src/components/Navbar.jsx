import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const isAdmin = user?.user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log("logout failed", error.response?.data);
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavButton = ({ to, label, extraClass = "" }) => (
    <button
      onClick={() => {
        navigate(to);
        setMenuOpen(false);
      }}
      className={`btn w-full md:w-auto ${
        isActive(to) ? "btn-primary" : "btn-neutral"
      } ${extraClass}`}
    >
      {label}
    </button>
  );

  return (
    <div className="navbar w-full bg-base-200 shadow-md p-4">
      <div className="w-full flex justify-between items-center">
        {/* Left: Logo or Title */}
        <div className="text-xl font-bold">Save Lives</div>

        {/* Mobile toggle button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-ghost"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4 items-center">
          {!isAdmin && (
            <>
              <NavButton to="/home" label="Home" />
              <NavButton to="/bankrequest" label="Bank request" />
            </>
          )}
          <NavButton to="/messagepage" label="Messages" />
          <NavButton to="/profile" label="Profile" />
          {isAdmin && (
            <NavButton
              to="/adminpage"
              label="Admin Panel"
              extraClass="btn-warning"
            />
          )}
          <button onClick={handleLogout} className="btn btn-neutral">
            Logout
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="flex flex-col space-y-2 mt-4 md:hidden">
          {!isAdmin && (
            <>
              <NavButton to="/home" label="Home" />
              <NavButton to="/bankrequest" label="Bank request" />
            </>
          )}
          <NavButton to="/messagepage" label="Messages" />
          <NavButton to="/profile" label="Profile" />
          {isAdmin && (
            <NavButton
              to="/adminpage"
              label="Admin Panel"
              extraClass="btn-warning"
            />
          )}
          <button onClick={handleLogout} className="btn btn-neutral">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
