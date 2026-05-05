import React, { useEffect } from "react";
import { useBankStore } from "../stores/useBankStore";

const UserBankRequest = () => {
  const { myRequests, loading, getUserBankRequests } = useBankStore();

  useEffect(() => {
    getUserBankRequests();
  }, [getUserBankRequests]);

  if (loading) return <p>Loading your bank requests...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Bank Requests</h2>
      {myRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul className="space-y-4">
          {myRequests.map((request) => (
            <li
              key={request._id}
              className="p-4 border rounded shadow-md bg-white"
            >
              <p>
                <strong>Bank:</strong> {request.bank.name}
              </p>
              <p>
                <strong>Blood Group:</strong> {request.bloodgroup}
              </p>
              <p>
                <strong>Quantity:</strong> {request.quantity} units
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    request.status === "pending"
                      ? "text-yellow-500"
                      : request.status === "accepted"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {request.status}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Requested at: {new Date(request.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserBankRequest;
