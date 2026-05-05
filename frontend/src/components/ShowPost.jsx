// frontend/src/components/ShowPost.jsx
import React, { useEffect } from "react";
import { usePostStore } from "../stores/usePostStore";
import { useAuthStore } from "../stores/useAuthStore";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import axios from "axios";
import Loading from "./Loading";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

const ShowPost = () => {
  const { posts, fetchPosts, loadingPosts } = usePostStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const handleMessage = async (receiver, text) => {
    try {
      if (!receiver?._id) return;
      await axiosInstance.post("/messages", {
        receiverId: receiver._id,
        text,
      });
      navigate("/messagepage", { state: { selectedUser: receiver } });
    } catch (error) {
      console.error("Failed to send message:", error.response?.data || error);
      alert("Failed to send message. Try again.");
    }
  };

  if (loadingPosts) return <Loading />;

  const list = Array.isArray(posts) ? posts : [];
  if (list.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-600">
        No posts found. Be the first to create one!
      </div>
    );
  }

  // current user id (safe)
  const myId = user?.user?._id ?? "";

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((post, idx) => {
        const author = post?.user ?? null;
        const authorId = author?._id ?? "";
        const isSelf = myId && authorId && myId === authorId;

        const hasLocation =
          post?.location &&
          typeof post.location.latitude === "number" &&
          typeof post.location.longitude === "number";

        return (
          <div
            key={post?._id ?? idx}
            className="card bg-base-100 shadow-md rounded-xl border hover:bg-base-300 transition duration-300 overflow-hidden"
          >
            <div className="card-body space-y-2">
              <h2 className="card-title text-lg text-red-600">
                Blood Group: {post?.bloodGroup ?? "N/A"}
              </h2>

              {post?.description && (
                <p className="text">
                  <strong>Description:</strong> {post.description}
                </p>
              )}

              {typeof post?.quantity === "number" && (
                <p>
                  <strong>Quantity:</strong> {post.quantity} bag
                  {post.quantity > 1 ? "s" : ""}
                </p>
              )}

              {post?.urgency && (
                <p>
                  <strong>Urgency:</strong>{" "}
                  <span
                    className={`badge ${
                      post.urgency === "High"
                        ? "badge-error"
                        : post.urgency === "Medium"
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {post.urgency}
                  </span>
                </p>
              )}

              {hasLocation && (
                <div className="h-40 mt-2 rounded overflow-hidden">
                  <MapContainer
                    center={[post.location.latitude, post.location.longitude]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[
                        post.location.latitude,
                        post.location.longitude,
                      ]}
                      icon={markerIcon}
                    />
                  </MapContainer>
                </div>
              )}

              {/* Only show Message button if:
                  - we know who the author is, and
                  - the current user is not the author */}
              {author && !isSelf && (
                <button
                  className="btn btn-primary w-full"
                  onClick={() =>
                    handleMessage(
                      author,
                      `Regarding your blood request: ${post?.description ?? ""}`
                    )
                  }
                >
                  Message {author?.name ?? "User"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShowPost;
