import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import UserPosts from "../components/UserPosts";
import UserNotifications from "../components/UserNotifications";
import PostStatus from "../components/PostStatus";
import UserBankRequest from "../components/UserBankRequest";
import { useAuthStore } from "../stores/useAuthStore";
import { useNotificationStore } from "../stores/useNotificationStore";

const Profile = () => {
  // All hooks run on every render, before any early return (the old page broke this rule).
  const me = useAuthStore((s) => s.user?.user);
  const calculateBMI = useAuthStore((s) => s.calculateBMI);
  const notifications = useNotificationStore((s) => s.notifications);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? "info");
  const [bmi, setBmi] = useState(null);

  useEffect(() => {
    calculateBMI().then(setBmi);
  }, [calculateBMI, me?.weight, me?.height]);

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  const isAdmin = me?.role === "admin";
  const unread = notifications.filter((n) => !n.isRead).length;
  const tabs = [
    { id: "info", label: "Profile" },
    ...(!isAdmin
      ? [
          { id: "status", label: "My requests" },
          { id: "posts", label: "Edit posts" },
          { id: "bank", label: "Blood bank requests" },
        ]
      : []),
    { id: "notifications", label: "Notifications", badge: unread },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <section className="card bg-base-100 border border-base-300 p-5 flex-row flex-wrap items-center gap-4">
          <span className="grid place-items-center w-16 h-16 rounded-full bg-primary text-primary-content text-2xl font-bold">
            {me?.bloodGroup}
          </span>
          <div className="flex-1 min-w-[12rem]">
            <h1 className="text-xl font-bold">Hello, {me?.name}</h1>
            {me?.createdAt && (
              <p className="text-sm text-base-content/70">
                Member since {new Date(me.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
              </p>
            )}
          </div>
          {bmi && (
            <div className="stats stats-horizontal border border-base-300">
              <div className="stat py-2 px-4">
                <div className="stat-title text-xs">BMI</div>
                <div className="stat-value text-xl">{bmi.bmi}</div>
                <div className="stat-desc">{bmi.category}</div>
              </div>
            </div>
          )}
        </section>

        <section className="card bg-base-100 border border-base-300">
          <div role="tablist" className="tabs tabs-border overflow-x-auto flex-nowrap px-2 pt-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                className={`tab whitespace-nowrap ${activeTab === t.id ? "tab-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
                {t.badge > 0 && <span className="badge badge-primary badge-xs ml-1">{t.badge}</span>}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === "info" && <UserInfo />}
            {activeTab === "status" && <PostStatus userId={me?._id} />}
            {activeTab === "posts" && <UserPosts userId={me?._id} />}
            {activeTab === "bank" && <UserBankRequest />}
            {activeTab === "notifications" && <UserNotifications />}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
