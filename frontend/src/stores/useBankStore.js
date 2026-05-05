import { create } from "zustand";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export const useBankStore = create((set, get) => ({
  bankData: [],
  filteredBankData: [],
  bankRequests: [],
  myRequests: [],
  loading: false,

  filterBanks: async (bloodgroup) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(
        "/searchFilter/filterBanksByBloodGroup",
        { params: { bloodgroup } }
      );
      set({ filteredBankData: res.data.banks }); // only update filtered data
      return res.data;
    } catch (error) {
      console.log("error filtering banks", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  fetchBankData: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/bank/getAllBankData");
      set({
        bankData: res.data,
      });
    } catch (error) {
      console.log("error fetching bank data", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  createBankRequest: async (data) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/bank/createbankrequest", data);
      return res;
    } catch (error) {
      console.log("error creating bank request", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  fetchBankRequests: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/bank/getAllBankRequests");
      set({ bankRequests: res.data });
    } catch (error) {
      console.log("error fetching bank requests", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  processBankRequest: async (requestid, action) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.patch(
        `/bank/processBankRequest/${requestid}`,
        { action }
      );
      const updatedRequests = get().bankRequests.filter(
        (req) => req._id !== requestid
      );
      set({ bankRequests: updatedRequests });
      return res;
    } catch (error) {
      console.log("error processing bank request", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  updateBankDetails: async (bankid, updatedData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.patch(
        `/bank/updateBankDetails/${bankid}`,
        updatedData
      );
      return res;
    } catch (error) {
      console.log("error updating bank details", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },
  getUserBankRequests: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/bank/getUserBankRequest");
      set({ myRequests: res.data });
    } catch (error) {
      console.log("error fetching bank requests", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },
}));
