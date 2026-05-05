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
    <div className="p-4 bg-base-200 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Filter Blood Banks by Group</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <select
          className="select select-bordered w-full md:w-60"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="" disabled className="text-black">
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
          {console.log("Filtered Bank Data:", filteredBankData)}
          {filteredBankData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBankData.map((bank) => (
                <div
                  key={bank._id}
                  className="bg-base-100 p-4 rounded shadow border"
                >
                  <h3 className="text-lg font-semibold mb-1">{bank.name}</h3>
                  <p>
                    <span className="font-medium">Available:</span>{" "}
                    {bank.quantity ?? 0} units
                  </p>

                  <p className="text-sm text">
                    Location: Lat {bank.location.latitude}, Lng{" "}
                    {bank.location.longitude}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text mt-4">
              No banks found for selected group.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default BankFilter;
