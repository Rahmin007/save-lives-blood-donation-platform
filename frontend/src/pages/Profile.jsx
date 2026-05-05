import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../stores/useAuthStore";
import UserInfo from "../components/UserInfo";
import UserPosts from "../components/UserPosts";
import UserNotifications from "../components/UserNotifications";
import PostStatus from "../components/PostStatus";
import UserBankRequest from "../components/UserBankRequest";
import { useNotificationStore } from "../stores/useNotificationStore";

const Profile = () => {
  const { user, calculateBMI, checkingAuth } = useAuthStore();
  const { getNotifications, notifications } = useNotificationStore();

  const [activeTab, setActiveTab] = useState("info");
  const [bmiResult, setBmiResult] = useState(null);

  // Handle loading / unauth states safely
  if (checkingAuth) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div>Checking session…</div>
      </div>
    );
  }

  // If not logged in, render a simple guard (avoid throwing)
  if (!user || !user.user) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">You’re not signed in</h2>
          <a className="btn btn-primary" href="/">Go to Login</a>
        </div>
      </div>
    );
  }

  const me = user.user; // now safe
  const isAdmin = me?.role === "admin";

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  useEffect(() => {
    getNotifications?.();
    const fetchBMI = async () => {
      const result = await calculateBMI();
      setBmiResult(result);
    };
    fetchBMI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <hr />

      {/* User Header */}
      <div className="w-full bg-black py-4 px-6 border-b border-gray-300">
        <h2 className="text-lg font-semibold">Hello, {me?.name || "User"}</h2>

        {bmiResult && (
          <div className="mt-2 text-sm">
            <p><span className="font-medium">BMI:</span> {Number(bmiResult.bmi).toFixed(2)}</p>
            <p><span className="font-medium">Category:</span> {bmiResult.category}</p>
          </div>
        )}

        {me?.createdAt && (
          <p className="text-sm opacity-80">
            Joined on{" "}
            {new Date(me.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      <hr />

      {/* Tabs */}
      <div className="w-4/5 mx-auto bg-base-100 mt-6 p-4 border border-gray-300 rounded-lg shadow-sm">
        <div className="flex justify-center space-x-6 pb-3">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-4 font-semibold ${
              activeTab === "info" ? "border-b-2 border-accent-content" : "text-warning hover:text-warning-content"
            }`}
          >
            Profile
          </button>

        {!isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-2 px-4 font-semibold ${
                activeTab === "posts" ? "border-b-2 border-accent-content" : "text-warning hover:text-warning-content"
              }`}
            >
              My Posts
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-2 px-4 font-semibold ${
                activeTab === "notifications" ? "border-b-2 border-accent-content" : "text-warning hover:text-warning-content"
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <div className="badge badge-xs badge-secondary ml-1 rounded">
                  {unreadCount}
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reqStatus")}
              className={`py-2 px-4 font-semibold ${
                activeTab === "reqStatus" ? "border-b-2 border-accent-content" : "text-warning hover:text-warning-content"
              }`}
            >
              Request Status
            </button>

            <button
              onClick={() => setActiveTab("userbankrequest")}
              className={`py-2 px-4 font-semibold ${
                activeTab === "userbankrequest" ? "border-b-2 border-accent-content" : "text-warning hover:text-warning-content"
              }`}
            >
              User Bank requests
            </button>
          </>
        )}
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === "info" && <UserInfo user={{ user: me }} />}
          {!isAdmin && (
            <>
              {activeTab === "posts" && <UserPosts userId={me?._id} />}
              {activeTab === "notifications" && <UserNotifications userId={me?._id} />}
              {activeTab === "reqStatus" && <PostStatus userId={me?._id} />}
              {activeTab === "userbankrequest" && <UserBankRequest />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
