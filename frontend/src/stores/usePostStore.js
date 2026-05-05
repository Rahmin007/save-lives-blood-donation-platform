import { create } from "zustand";

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export const usePostStore = create((set, get) => ({
  posts: [],
  postStatus: [],
  loadingPosts: false,

  fetchPosts: async () => {
    set({ loadingPosts: true });
    try {
      const res = await axiosInstance.get("/post/getAllPosts");

      set({ posts: res.data });
    } catch (error) {
      console.log("error fetching posts", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  createPost: async (postData) => {
    set({ loadingPosts: true });
    try {
      const res = await axiosInstance.post("/post/createPost", postData);
      set((state) => ({ posts: [...state.posts, res.data] }));
      return res;
    } catch (error) {
      console.log("error creating post", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  updatePost: async (postId, updatedPostData) => {
    set({ loadingPosts: true });
    try {
      const res = await axiosInstance.patch(
        `/post/updatePost/${postId}`,
        updatedPostData
      );
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...res.data.post, _id: post._id } : post
        ),
      }));
    } catch (error) {
      console.log("Updating post failed:", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  deletePost: async (postId) => {
    set({ loadingPosts: true });
    try {
      await axiosInstance.delete(`/post/deletePost/${postId}`);

      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
      }));
    } catch (error) {
      console.log("Deleting post failed:", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  fetchUserPosts: async (userId) => {
    set({ loadingPosts: true });
    try {
      const res = await axiosInstance.get(`/post/getUserPosts/${userId}`);
      set({ posts: res.data });
    } catch (error) {
      console.log("error fetching posts", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  getPostStatus: async () => {
    set({ loadingPosts: true });
    try {
      const res = await axiosInstance.get(`/post/getPostStatus`);
      set({ postStatus: res.data });
    } catch (error) {
      console.log("error fetching post statuses", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  cancelPost: async (postId) => {
    set({ loadingPosts: true });
    try {
      const res = await axiosInstance.patch(`/post/${postId}/cancel`);
      // Optionally update the local store to reflect that the post is canceled.
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? { ...post, canceled: true, canceledAt: new Date() }
            : post
        ),
      }));
      return res;
    } catch (error) {
      console.log("Canceling post failed:", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },

  filterPost: async (filters) => {
    set({ loadingPosts: true });
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axiosInstance.get(`/searchFilter/filterPosts?${query}`);

      set({ posts: res.data.posts });
    } catch (error) {
      console.log("Error filtering posts:", error.response?.data);
    } finally {
      set({ loadingPosts: false });
    }
  },
}));
