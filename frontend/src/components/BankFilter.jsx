import { useState } from "react";
import { useBankStore } from "../stores/useBankStore";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BankFilter = () => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { filterBanks, filteredBankData } = useBankStore();

  const handleSearch = async () => {
    if (!selectedGroup) return;
    await filterBanks(selectedGroup);
    setHasSearched(true);
  };

  const handleReset = () => {
    setSelectedGroup("");
    setHasSearched(false);
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-4">
      <h2 className="text-lg font-bold mb-4">Stock by blood group</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <select
          className="select select-bordered w-full md:w-60"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="" disabled>
            Select Blood Group
          </option>
          {bloodGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>

        {hasSearched && (
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>

      {/* Show results only after search */}
      {hasSearched && (
        <>
          {filteredBankData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBankData.map((bank) => (
                <div
                  key={bank._id}
                  className="border border-base-300 rounded-box p-4"
                >
                  <h3 className="text-lg font-semibold mb-1">{bank.name}</h3>
                  <p>
                    <span className="font-medium">Available:</span>{" "}
                    {bank.quantity ?? 0} bags
                  </p>


                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-base-content/60 mt-4">
              No banks found for selected group.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default BankFilter;
