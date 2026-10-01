import { useState } from "react";
import { usePostStore } from "../stores/usePostStore";

const PostFilter = () => {
  const { filterPost, clearFilter, activeFilter } = usePostStore();
  const [urgency, setUrgency] = useState(activeFilter?.urgency ?? "");
  const [time, setTime] = useState(activeFilter?.time ?? "");

  const apply = () => {
    const filters = {};
    if (urgency) filters.urgency = urgency;
    if (time) filters.time = time;
    if (!urgency && !time) return clearFilter();
    filterPost(filters);
  };

  const reset = () => {
    setUrgency("");
    setTime("");
    clearFilter();
  };

  return (
    <div className="card bg-base-100 p-4 mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
      <label className="form-control">
        <span className="label-text mb-1">Urgency</span>
        <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="select select-bordered select-sm w-full">
          <option value="">Any</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </label>
      <label className="form-control">
        <span className="label-text mb-1">Posted</span>
        <select value={time} onChange={(e) => setTime(e.target.value)} className="select select-bordered select-sm w-full">
          <option value="">Any time</option>
          <option value="today">Today</option>
          <option value="1 week">Last 7 days</option>
          <option value="1 month">Last 30 days</option>
        </select>
      </label>
      <button onClick={apply} className="btn btn-primary btn-sm">Apply</button>
      <button onClick={reset} className="btn btn-ghost btn-sm" disabled={!activeFilter && !urgency && !time}>Clear</button>
    </div>
  );
};

export default PostFilter;
