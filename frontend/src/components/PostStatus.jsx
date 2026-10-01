import { useEffect } from "react";
import { usePostStore } from "../stores/usePostStore";
import { timeAgo } from "../lib/format";
import Loading from "./Loading";

const statusOf = (post) =>
  post.canceled ? ["Cancelled", "badge-ghost"] : post.pending ? ["Open", "badge-warning"] : ["Fulfilled", "badge-success"];

/** Your requests, with "Mark fulfilled" and "Cancel". */
const PostStatus = ({ userId }) => {
  const { myPosts, loadingMyPosts, fetchUserPosts, cancelPost, updatePost } = usePostStore();

  useEffect(() => {
    if (userId) fetchUserPosts(userId);
  }, [userId, fetchUserPosts]);

  if (loadingMyPosts) return <Loading fullScreen={false} />;
  if (!myPosts.length) return <p className="text-center text-base-content/60 py-8">You haven't posted any blood requests yet.</p>;

  return (
    <ul className="space-y-3">
      {myPosts.map((post) => {
        const [label, badge] = statusOf(post);
        return (
          <li key={post._id} className={`border border-base-300 rounded-box p-4 ${post.canceled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <p className="font-semibold">
                {post.bloodGroup} · {post.quantity} bag{post.quantity > 1 ? "s" : ""}
                <span className="text-sm font-normal text-base-content/60"> · {timeAgo(post.createdAt)}</span>
              </p>
              <span className={`badge ${badge}`}>{label}</span>
            </div>
            <p className="mt-1 break-words">{post.description}</p>
            {!post.canceled && post.pending && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="btn btn-success btn-sm" onClick={() => updatePost(post._id, { pending: false })}>
                  I received the blood
                </button>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => window.confirm("Cancel this request? It will be removed from the feed.") && cancelPost(post._id)}
                >
                  Cancel request
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default PostStatus;
