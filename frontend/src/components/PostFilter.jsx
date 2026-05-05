import React, { useState } from "react";
import { usePostStore } from "../stores/usePostStore";

const PostFilter = () => {
  const { filterPost } = usePostStore();
  const [urgency, setUrgency] = useState("");
  const [time, setTime] = useState("");

  const handlePostFilter = () => {
    const filters = {};
    if (urgency) filters.urgency = urgency;
    if (time) filters.time = time;
    filterPost(filters);
  };

  return (
    <div className="space-y-2 p-4 bg-base-300 rounded shadow">
      <h3 className="text-lg font-semibold text">Filter Posts</h3>

      <select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Urgency</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Time</option>
        <option value="today">Today</option>
        <option value="1 week">Last 1 Week</option>
        <option value="1 month">Last 1 Month</option>
      </select>

      <button onClick={handlePostFilter} className="btn w-full">
        Filter Posts
      </button>
    </div>
  );
};

export default PostFilter;
