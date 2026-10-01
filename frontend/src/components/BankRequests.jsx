import { useEffect } from "react";
import { useBankStore } from "../stores/useBankStore";
import { formatDateTime } from "../lib/format";
import Loading from "./Loading";

const BADGE = { pending: "badge-warning", accepted: "badge-success", rejected: "badge-error" };

/** Admin: approve or reject blood-bank requests (pending ones first). */
const BankRequests = () => {
  const { bankRequests, loading, fetchBankRequests, processBankRequest } = useBankStore();

  useEffect(() => {
    fetchBankRequests();
  }, [fetchBankRequests]);

  if (loading && !bankRequests.length) return <Loading fullScreen={false} />;
  if (!bankRequests.length) return <p className="text-center text-base-content/60 py-8">No requests yet.</p>;

  return (
    <ul className="space-y-3">
      {bankRequests.map((r) => (
        <li key={r._id} className="card bg-base-100 border border-base-300 p-4 flex-row flex-wrap items-center gap-4 justify-between">
          <div>
            <p className="font-semibold">{r.bloodgroup} · {r.quantity} bag{r.quantity > 1 ? "s" : ""} · {r.bank?.name ?? "Unknown bank"}</p>
            <p className="text-sm text-base-content/70">
              Requested by {r.user?.name ?? "a user"}{r.user?.mobile ? ` (+880${r.user.mobile})` : ""} · {formatDateTime(r.createdAt)}
            </p>
          </div>
          {r.status === "pending" ? (
            <div className="flex gap-2">
              <button className="btn btn-success btn-sm" onClick={() => processBankRequest(r._id, "accepted")}>Approve</button>
              <button className="btn btn-outline btn-error btn-sm" onClick={() => processBankRequest(r._id, "rejected")}>Reject</button>
            </div>
          ) : (
            <span className={`badge ${BADGE[r.status]}`}>{r.status}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default BankRequests;
