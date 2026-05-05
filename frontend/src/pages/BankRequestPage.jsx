// frontend/src/pages/BankRequestPage.jsx
import { useState } from "react";
import BankMapCard from "../components/BankCard";
import { useBankStore } from "../stores/useBankStore";
import Navbar from "../components/Navbar";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BankRequestPage = () => {
  const { createBankRequest } = useBankStore();
  const [selectedBank, setSelectedBank] = useState(null);

  const [formData, setFormData] = useState({
    bloodgroup: "",
    quantity: "",
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBank) return alert("⚠️ Please select a bank from the map.");

    const payload = {
      bank: selectedBank.name,
      bloodgroup: formData.bloodgroup,
      quantity: formData.quantity,
      location: selectedBank.location,
    };

    const res = await createBankRequest(payload);
    if (res?.status === 200) {
      alert("✅ Bank request submitted!");
      setFormData({ bloodgroup: "", quantity: "" });
      setSelectedBank(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Map with banks */}
        <BankMapCard onBankSelect={setSelectedBank} />

        {/* Selected bank info */}
        {selectedBank && (
          <div className="bg-green-100 p-4 rounded-md mt-4">
            <p className="font-medium">
              Selected Bank: <span className="text-red-600">{selectedBank.name}</span>
            </p>
            <p className="text-sm text-gray-700">
              Location: Lat {selectedBank.location.latitude}, Lng {selectedBank.location.longitude}
            </p>
          </div>
        )}

        {/* Request form */}
        <div className="bg-base-200 p-6 rounded-lg shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">Request Blood from Bank</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Blood Group</label>
              <select
                name="bloodgroup"
                className="w-full p-2 border rounded"
                value={formData.bloodgroup}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Quantity (bags)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                min={1}
                max={10}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BankRequestPage;
