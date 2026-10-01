import { useEffect, useState } from "react";
import { useBankStore } from "../stores/useBankStore";
import { GROUP_KEYS } from "../lib/map";

/** Admin: edit each bank's stock in a table. */
const BankStock = () => {
  const { bankData, fetchBankData, updateBankDetails } = useBankStore();
  const [edits, setEdits] = useState({}); // bankId -> { key: value }

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  const value = (bank, key) => edits[bank._id]?.[key] ?? bank.bloodInventory?.[key] ?? 0;
  const change = (bankId, key, v) => setEdits((e) => ({ ...e, [bankId]: { ...e[bankId], [key]: v } }));

  const save = async (bank) => {
    const inventory = Object.fromEntries(Object.entries(edits[bank._id] ?? {}).map(([k, v]) => [k, Number(v)]));
    if (await updateBankDetails(bank._id, { bloodInventory: inventory })) {
      setEdits((e) => ({ ...e, [bank._id]: undefined }));
    }
  };

  return (
    <div className="overflow-x-auto card bg-base-100 border border-base-300">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Blood bank</th>
            {GROUP_KEYS.map(([label]) => <th key={label} className="text-center">{label}</th>)}
            <th />
          </tr>
        </thead>
        <tbody>
          {bankData.map((bank) => (
            <tr key={bank._id}>
              <td className="font-medium min-w-48">{bank.name}</td>
              {GROUP_KEYS.map(([label, key]) => (
                <td key={key}>
                  <input type="number" min={0} className="input input-bordered input-xs w-16 text-center"
                    aria-label={`${bank.name} ${label} stock`} value={value(bank, key)}
                    onChange={(e) => change(bank._id, key, e.target.value)} />
                </td>
              ))}
              <td>
                <button className="btn btn-primary btn-xs" disabled={!edits[bank._id]} onClick={() => save(bank)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BankStock;
