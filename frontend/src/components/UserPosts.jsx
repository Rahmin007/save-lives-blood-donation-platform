import { useEffect, useState } from "react";
import { usePostStore } from "../stores/usePostStore";
import Loading from "./Loading";

/** Edit or delete your own posts. */
const UserPosts = ({ userId }) => {
  const { myPosts, fetchUserPosts, deletePost, updatePost, loadingMyPosts } = usePostStore();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ description: "", quantity: "" });

  useEffect(() => {
    if (userId) fetchUserPosts(userId);
  }, [userId, fetchUserPosts]);

  if (loadingMyPosts) return <Loading fullScreen={false} />;
  if (!myPosts.length) return <p className="text-center text-base-content/60 py-8">You haven't posted anything yet.</p>;

  const startEdit = (post) => {
    setEditingId(post._id);
    setDraft({ description: post.description, quantity: post.quantity });
  };

  const save = async () => {
    if (await updatePost(editingId, { description: draft.description, quantity: Number(draft.quantity) })) {
      setEditingId(null);
    }
  };

  return (
    <ul className="space-y-3">
      {myPosts.map((post) => (
        <li key={post._id} className="border border-base-300 rounded-box p-4 space-y-3">
          {editingId === post._id ? (
            <>
              <label className="form-control">
                <span className="label-text mb-1">Description</span>
                <textarea className="textarea textarea-bordered" maxLength={1000} value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
              </label>
              <label className="form-control max-w-xs">
                <span className="label-text mb-1">Bags needed (1–10)</span>
                <input type="number" min={1} max={10} className="input input-bordered" value={draft.quantity}
                  onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))} />
              </label>
              <div className="flex gap-2">
                <button onClick={save} className="btn btn-primary btn-sm">Save</button>
                <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="font-semibold">{post.bloodGroup} · {post.quantity} bag{post.quantity > 1 ? "s" : ""}
                  {post.canceled && <span className="badge badge-ghost ml-2">Cancelled</span>}</p>
                <p className="break-words">{post.description}</p>
              </div>
              <div className="flex gap-2">
                {!post.canceled && <button onClick={() => startEdit(post)} className="btn btn-outline btn-sm">Edit</button>}
                <button
                  onClick={() => window.confirm("Delete this post permanently?") && deletePost(post._id)}
                  className="btn btn-ghost btn-sm text-error"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default UserPosts;
