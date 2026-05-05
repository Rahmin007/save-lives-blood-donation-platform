import React, { useEffect } from "react";
import { usePostStore } from "../stores/usePostStore";
import Loading from "./Loading";

const PostStatus = ({ userId }) => {
  const { posts, loadingPosts, fetchUserPosts, cancelPost } = usePostStore();

  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
    }
  }, [userId, fetchUserPosts]);

  if (loadingPosts) {
    return <Loading />;
  }

  return (
    <>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className={` border p-4 rounded shadow flex flex-col gap-3 transition  ${
              post.canceled ? "bg-gray-200 text-gray-500" : "bg-base-100"
            }`}
          >
            <p className="font-semibold">{post.description}</p>
            <p>Quantity: {post.quantity} Bags</p>

            {!post.canceled ? (
              <span className="text-sm text-yellow-600 font-medium">
                Status: Pending
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">
                Status: Canceled
              </span>
            )}

            <button
              onClick={() => cancelPost(post._id)}
              disabled={post.canceled}
              className={`px-4 py-2 rounded mt-2 w-max transition text-white ${
                post.canceled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {post.canceled ? "Canceled" : "Cancel Post"}
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default PostStatus;
