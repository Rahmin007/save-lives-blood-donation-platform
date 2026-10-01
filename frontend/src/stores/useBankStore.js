import { create } from "zustand";
import toast from "react-hot-toast";
import { api, errorMessage } from "../lib/api";

export const useBankStore = create((set) => ({
  bankData: [],
  filteredBankData: [],
  bankRequests: [],
  myRequests: [],
  loading: false,

  filterBanks: async (bloodgroup) => {
    set({ loading: true });
    try {
      const res = await api.get("/searchFilter/filterBanksByBloodGroup", { params: { bloodgroup } });
      set({ filteredBankData: res.data.banks });
      return res.data;
    } catch (error) {
      toast.error(errorMessage(error, "Could not search blood banks."));
    } finally {
      set({ loading: false });
    }
  },

  fetchBankData: async () => {
    try {
      set({ bankData: (await api.get("/bank/getAllBankData")).data });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load blood banks."));
    }
  },

  /** Returns true on success. */
  createBankRequest: async (data) => {
    set({ loading: true });
    try {
      await api.post("/bank/createbankrequest", data);
      toast.success("Request sent. You'll get a notification when it's processed.");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Could not send the request."));
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchBankRequests: async () => {
    set({ loading: true });
    try {
      set({ bankRequests: (await api.get("/bank/getAllBankRequests")).data });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load requests."));
    } finally {
      set({ loading: false });
    }
  },

  processBankRequest: async (requestid, action) => {
    try {
      const { request } = (await api.patch(`/bank/processBankrequest/${requestid}`, { action })).data;
      set((state) => ({
        bankRequests: state.bankRequests.map((r) => (r._id === requestid ? { ...r, status: request.status } : r)),
      }));
      toast.success(`Request ${action}.`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not process the request."));
    }
  },

  updateBankDetails: async (bankid, updatedData) => {
    try {
      const { bank } = (await api.patch(`/bank/updateBankDetails/${bankid}`, updatedData)).data;
      set((state) => ({ bankData: state.bankData.map((b) => (b._id === bankid ? bank : b)) }));
      toast.success("Blood bank updated.");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Could not update the blood bank."));
      return false;
    }
  },

  getUserBankRequests: async () => {
    set({ loading: true });
    try {
      set({ myRequests: (await api.get("/bank/getUserBankRequest")).data });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load your requests."));
    } finally {
      set({ loading: false });
    }
  },
}));
