import { useState } from "react";
import Navbar from "../components/Navbar";
import BankMapCard from "../components/BankCard";
import { useBankStore } from "../stores/useBankStore";
import { INVENTORY_KEY } from "../lib/map";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BankRequestPage = () => {
  const { createBankRequest, bankData, loading } = useBankStore();
  const [bankId, setBankId] = useState("");
  const [formData, setFormData] = useState({ bloodgroup: "", quantity: 1 });
  const selectedBank = bankData.find((b) => b._id === bankId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await createBankRequest({ bank: bankId, bloodgroup: formData.bloodgroup, quantity: Number(formData.quantity) });
    if (ok) setFormData({ bloodgroup: "", quantity: 1 });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <BankMapCard onBankSelect={(bank) => setBankId(bank._id)} />

        <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-300 p-5 space-y-4 self-start">
          <div>
            <h1 className="text-xl font-bold">Request blood from a bank</h1>
            <p className="text-sm text-base-content/70">An admin reviews your request and you'll be notified.</p>
          </div>
          <label className="form-control">
            <span className="label-text mb-1">Blood bank</span>
            <select className="select select-bordered w-full" value={bankId} onChange={(e) => setBankId(e.target.value)} required>
              <option value="">Choose a bank (or tap the map)</option>
              {bankData.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Blood group</span>
            <select className="select select-bordered w-full" value={formData.bloodgroup} required
              onChange={(e) => setFormData((f) => ({ ...f, bloodgroup: e.target.value }))}>
              <option value="">Choose…</option>
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Bags (1–10)</span>
            <input type="number" min={1} max={10} className="input input-bordered w-full" value={formData.quantity} required
              onChange={(e) => setFormData((f) => ({ ...f, quantity: e.target.value }))} />
          </label>
          {selectedBank && formData.bloodgroup && (
            <p className="text-sm text-base-content/70">
              In stock at {selectedBank.name}:{" "}
              <b>{selectedBank.bloodInventory?.[INVENTORY_KEY[formData.bloodgroup]] ?? 0} bags</b>
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Sending…" : "Send request"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default BankRequestPage;
