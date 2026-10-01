import { useState } from "react";
import Navbar from "../components/Navbar";
import BankFilter from "../components/BankFilter";
import BankMapCard from "../components/BankCard";
import BankRequests from "../components/BankRequests";
import BankStock from "../components/BankStock";
import UserNotifications from "../components/UserNotifications";
import { useBankStore } from "../stores/useBankStore";
import { useNotificationStore } from "../stores/useNotificationStore";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const pending = useBankStore((s) => s.bankRequests.filter((r) => r.status === "pending").length);
  const unread = useNotificationStore((s) => s.notifications.filter((n) => !n.isRead).length);

  const tabs = [
    { id: "requests", label: "Requests", badge: pending },
    { id: "stock", label: "Stock" },
    { id: "filter", label: "Search banks" },
    { id: "map", label: "Map" },
    { id: "notifications", label: "Notifications", badge: unread },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <div role="tablist" className="tabs tabs-box overflow-x-auto flex-nowrap">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={activeTab === t.id}
              className={`tab whitespace-nowrap ${activeTab === t.id ? "tab-active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
              {t.badge > 0 && <span className="badge badge-primary badge-xs ml-1">{t.badge}</span>}
            </button>
          ))}
        </div>
        {activeTab === "requests" && <BankRequests />}
        {activeTab === "stock" && <BankStock />}
        {activeTab === "filter" && <BankFilter />}
        {activeTab === "map" && <BankMapCard />}
        {activeTab === "notifications" && <div className="card bg-base-100 border border-base-300 p-4"><UserNotifications /></div>}
      </main>
    </div>
  );
};

export default AdminPage;
