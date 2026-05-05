import React, { useEffect, useState } from "react";
import { usePostStore } from "../stores/usePostStore";
import Loading from "./Loading";

const UserPost = ({ userId }) => {
  const { posts, fetchUserPosts, deletePost, updatePost, loadingPosts } =
    usePostStore();

  const [editingPostId, setEditingPostId] = useState(null);
  const [editedData, setEditedData] = useState({
    description: "",
    quantity: "",
  });

  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
    }
  }, [userId, fetchUserPosts]);
  if (loadingPosts) {
    return (
      <>
        <Loading />
      </>
    );
  }

  const handleEditClick = (post) => {
    setEditingPostId(post._id);
    setEditedData({
      description: post.description || "",
      quantity: post.quantity || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    await updatePost(editingPostId, {
      description: editedData.description,
      quantity: editedData.quantity,
    });
    setEditingPostId(null);
    setEditedData({ description: "", quantity: "" });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedData({ description: "", quantity: "" });
  };

  const handleDelete = async (postId) => {
    await deletePost(postId);
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No Posts found.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="border p-4 rounded shadow flex flex-col gap-3"
          >
            {editingPostId === post._id ? (
              <>
                <div>
                  <label className="block font-semibold">Description</label>
                  <textarea
                    name="description"
                    value={editedData.description}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold">Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    value={editedData.quantity}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-4 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-lg font-medium">
                    Description: {post.description}
                  </p>
                  <p>Quantity: {post.quantity}</p>
                  {post.canceled && (
                    <span className="text-red-500 text-sm font-semibold">
                      Cancelled
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="bg-yellow-500 text-white px-4 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserPost;
