import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useBankStore } from "../stores/useBankStore";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import BankFilter from "../components/BankFilter";
import BankMapCard from "../components/BankCard";
import BankRequests from "../components/BankRequests";
import UserNotifications from "../components/UserNotifications";
import { useNotificationStore } from "../stores/useNotificationStore";
const AdminPage = () => {
  const { user, checkingAuth } = useAuthStore();
  const { fetchBankData, bankRequests, fetchBankRequests } = useBankStore();
  const { notifications, getNotifications } = useNotificationStore();
  const [activeTab, setActiveTab] = useState("filter");
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadRequestCount = bankRequests.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!checkingAuth && user?.user?.role !== "admin") {
      navigate("/home");
    } else {
      fetchBankData();
      getNotifications();
      fetchBankRequests();
    }
  }, [checkingAuth, user]);

  if (checkingAuth || !user) return <Loading />;

  return (
    <div>
      <Navbar />
      <hr />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-bordered mb-6">
          <a
            role="tab"
            className={`tab ${activeTab === "filter" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("filter")}
          >
            Filter
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === "map" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Requests
            {unreadRequestCount > 0 && (
              <div className="badge badge-xs badge-secondary ml-1 rounded ">
                {unreadRequestCount}
              </div>
            )}
          </a>
          <a
            role="tab"
            className={`tab ${
              activeTab === "notifications" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
            {unreadCount > 0 && (
              <div className="badge badge-xs badge-secondary ml-1 rounded ">
                {unreadCount}
              </div>
            )}
          </a>
        </div>

        {/* Tab content */}
        {activeTab === "filter" && <BankFilter />}
        {activeTab === "map" && <BankMapCard />}
        {activeTab === "requests" && <BankRequests />}
        {activeTab === "notifications" && <UserNotifications />}
      </div>
    </div>
  );
};

export default AdminPage;
