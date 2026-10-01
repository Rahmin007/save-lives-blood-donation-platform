import { useEffect } from "react";
import { useBankStore } from "../stores/useBankStore";
import { formatDateTime } from "../lib/format";
import Loading from "./Loading";

const BADGE = { pending: "badge-warning", accepted: "badge-success", rejected: "badge-error" };

const UserBankRequest = () => {
  const { myRequests, loading, getUserBankRequests } = useBankStore();

  useEffect(() => {
    getUserBankRequests();
  }, [getUserBankRequests]);

  if (loading && !myRequests.length) return <Loading fullScreen={false} />;
  if (!myRequests.length) return <p className="text-center text-base-content/60 py-8">You haven't requested blood from a bank yet.</p>;

  return (
    <ul className="space-y-3">
      {myRequests.map((r) => (
        <li key={r._id} className="border border-base-300 rounded-box p-4 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="font-semibold">{r.bloodgroup} · {r.quantity} bag{r.quantity > 1 ? "s" : ""} from {r.bank?.name ?? "a blood bank"}</p>
            <p className="text-sm text-base-content/60">{formatDateTime(r.createdAt)}</p>
          </div>
          <span className={`badge ${BADGE[r.status]}`}>{r.status}</span>
        </li>
      ))}
    </ul>
  );
};

export default UserBankRequest;
