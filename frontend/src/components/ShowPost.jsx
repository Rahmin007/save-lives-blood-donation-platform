import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MessageCircle, MapPin, Clock } from "lucide-react";
import { usePostStore } from "../stores/usePostStore";
import { useAuthStore } from "../stores/useAuthStore";
import { markerIcon } from "../lib/map";
import { timeAgo } from "../lib/format";
import Loading from "./Loading";

const URGENCY_BADGE = { High: "badge-error", Medium: "badge-warning", Low: "badge-success" };

const ShowPost = () => {
  const { posts, fetchPosts, loadingPosts, activeFilter } = usePostStore();
  const me = useAuthStore((s) => s.user?.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Opens the chat with a suggested first message; nothing is sent until the user presses Send.
  const openChat = (author, post) =>
    navigate("/messagepage", {
      state: {
        selectedUser: author,
        draft: `Hi ${author.name}, I saw your request for ${post.bloodGroup} blood and I may be able to help.`,
      },
    });

  if (loadingPosts) return <Loading fullScreen={false} label="Loading requests" />;

  if (!posts.length) {
    return (
      <div className="card bg-base-100 p-10 text-center text-base-content/70">
        {activeFilter ? "No requests match this filter." : "No blood requests yet. Need blood? Post a request above."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {posts.map((post) => {
        const author = post.user;
        const isSelf = author?._id === me?._id;
        const hasLocation = Number.isFinite(post.location?.latitude) && Number.isFinite(post.location?.longitude);

        return (
          <article key={post._id} className={`card bg-base-100 shadow-sm border border-base-300 ${post.pending ? "" : "opacity-70"}`}>
            <div className="card-body gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-14 h-14 rounded-full bg-primary text-primary-content text-xl font-bold shrink-0">
                    {post.bloodGroup}
                  </span>
                  <div>
                    <p className="font-semibold">{post.quantity} bag{post.quantity > 1 ? "s" : ""} needed</p>
                    <p className="text-sm text-base-content/70">by {author?.name ?? "Unknown"}{isSelf && " (you)"}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge ${URGENCY_BADGE[post.urgency] ?? "badge-ghost"}`}>{post.urgency}</span>
                  {!post.pending && <span className="badge badge-success badge-outline">Fulfilled</span>}
                </div>
              </div>

              <p className="whitespace-pre-line break-words">{post.description}</p>

              <p className="text-xs text-base-content/60 flex items-center gap-1">
                <Clock size={13} aria-hidden="true" /> {timeAgo(post.createdAt)}
              </p>

              {hasLocation && (
                <div className="h-36 rounded-lg overflow-hidden" aria-label="Location map">
                  <MapContainer
                    center={[post.location.latitude, post.location.longitude]}
                    zoom={13}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[post.location.latitude, post.location.longitude]} icon={markerIcon} />
                  </MapContainer>
                </div>
              )}

              <div className="card-actions items-center justify-between">
                {hasLocation && (
                  <a
                    className="link text-sm flex items-center gap-1"
                    href={`https://www.google.com/maps?q=${post.location.latitude},${post.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={14} aria-hidden="true" /> Directions
                  </a>
                )}
                {author && !isSelf && post.pending && (
                  <button className="btn btn-primary btn-sm" onClick={() => openChat(author, post)}>
                    <MessageCircle size={16} aria-hidden="true" /> Message {author.name.split(" ")[0]}
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ShowPost;
