import React, { useEffect } from "react";
import { useBankStore } from "../stores/useBankStore";
import Loading from "./Loading";

const BankRequests = () => {
  const { bankRequests, loading, fetchBankRequests, processBankRequest } =
    useBankStore();

  // Fetch bank requests on component mount
  useEffect(() => {
    fetchBankRequests();
  }, [fetchBankRequests]);

  // Handle the approval or rejection of a request
  const handleProcessRequest = (requestId, action) => {
    processBankRequest(requestId, action);
  };

  // If requests are still loading, show the loading spinner
  if (loading) return <Loading />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bank Requests</h2>

      {bankRequests.length === 0 ? (
        <p>No requests found</p>
      ) : (
        <div className="space-y-4">
          {bankRequests.map((request) => (
            <div
              key={request._id}
              className="border p-4 rounded-lg shadow-md hover:shadow-lg"
            >
              <h3 className="font-bold text-lg">{request.bank.name}</h3>
              <p>
                <span className="font-semibold">Blood Group:</span>{" "}
                {request.bloodgroup}
              </p>
              <p>
                <span className="font-semibold">Quantity:</span>{" "}
                {request.quantity}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {request.status}
              </p>

              <div className="flex justify-end gap-4 mt-4">
                {/* Approve button */}
                <button
                  className="btn btn-success"
                  onClick={() => handleProcessRequest(request._id, "accepted")}
                  disabled={request.status !== "pending"}
                >
                  Approve
                </button>

                {/* Reject button */}
                <button
                  className="btn btn-error"
                  onClick={() => handleProcessRequest(request._id, "rejected")}
                  disabled={request.status !== "pending"}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankRequests;
