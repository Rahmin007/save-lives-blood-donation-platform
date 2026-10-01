import { create } from "zustand";
import toast from "react-hot-toast";
import { api, errorMessage } from "../lib/api";

export const usePostStore = create((set, get) => ({
  posts: [], // main feed
  myPosts: [], // profile page (kept separate so it doesn't overwrite the feed)
  loadingPosts: false,
  loadingMyPosts: false,
  submitting: false,
  activeFilter: null, // { urgency, time } while the feed is filtered

  fetchPosts: async () => {
    set({ loadingPosts: true, activeFilter: null });
    try {
      set({ posts: (await api.get("/post/getAllPosts")).data });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load posts."));
    } finally {
      set({ loadingPosts: false });
    }
  },

  /** Returns true on success so the form only clears when the post was saved. */
  createPost: async (postData) => {
    set({ submitting: true });
    try {
      const res = await api.post("/post/createPost", postData);
      set((state) => ({ posts: [res.data.post, ...state.posts] })); // newest first
      const n = res.data.notifiedDonors;
      toast.success(n ? `Request posted. ${n} nearby donor${n > 1 ? "s were" : " was"} notified.` : "Request posted.");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the post."));
      return false;
    } finally {
      set({ submitting: false });
    }
  },

  updatePost: async (postId, changes) => {
    try {
      const { post } = (await api.patch(`/post/updatePost/${postId}`, changes)).data;
      const replace = (list) => list.map((p) => (p._id === postId ? post : p));
      set((state) => ({ posts: replace(state.posts), myPosts: replace(state.myPosts) }));
      toast.success(changes.pending === false ? "Marked as fulfilled. Thank you!" : "Post updated.");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Could not update the post."));
      return false;
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/post/deletePost/${postId}`);
      const drop = (list) => list.filter((p) => p._id !== postId);
      set((state) => ({ posts: drop(state.posts), myPosts: drop(state.myPosts) }));
      toast.success("Post deleted.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the post."));
    }
  },

  cancelPost: async (postId) => {
    try {
      const { post } = (await api.patch(`/post/${postId}/cancel`)).data;
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== postId),
        myPosts: state.myPosts.map((p) => (p._id === postId ? { ...p, ...post, user: p.user } : p)),
      }));
      toast.success("Request cancelled.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not cancel the post."));
    }
  },

  fetchUserPosts: async (userId) => {
    set({ loadingMyPosts: true });
    try {
      set({ myPosts: (await api.get(`/post/getUserPosts/${userId}`)).data });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load your posts."));
    } finally {
      set({ loadingMyPosts: false });
    }
  },

  filterPost: async (filters) => {
    set({ loadingPosts: true });
    try {
      const query = new URLSearchParams(filters).toString();
      set({ posts: (await api.get(`/searchFilter/filterPosts?${query}`)).data.posts, activeFilter: filters });
    } catch (error) {
      toast.error(errorMessage(error, "Could not filter posts."));
    } finally {
      set({ loadingPosts: false });
    }
  },

  clearFilter: () => get().fetchPosts(),
}));
