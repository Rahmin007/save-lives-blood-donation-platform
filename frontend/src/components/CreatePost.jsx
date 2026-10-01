import React, { useState } from "react";
import MapComponent from "./MapComponent";
import { usePostStore } from "../stores/usePostStore";

const steps = [
  "Description",
  "Blood Group",
  "Quantity",
  "Location",
  "Urgency Level",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = ["Low", "Medium", "High"];

const CreatePost = () => {
  const { createPost, submitting } = usePostStore();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    description: "",
    bloodGroup: "",
    quantity: "",
    location: null,
    urgency: "",
  });

  const [error, setError] = useState("");

  const nextStep = () => {
    if (!validateStep()) return;
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!formData.description.trim()) {
          setError("Description is required.");
          return false;
        }
        break;
      case 1:
        if (!formData.bloodGroup) {
          setError("Please select a blood group.");
          return false;
        }
        break;
      case 2: {
        const quantity = Number(formData.quantity);
        if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 10) {
          setError("Enter a quantity between 1 and 10.");
          return false;
        }
        break;
      }

      case 3:
        if (
          !formData.location ||
          !formData.location.latitude ||
          !formData.location.longitude
        ) {
          setError("Please select a location.");
          return false;
        }
        break;
      case 4:
        if (!formData.urgency) {
          setError("Please select an urgency level.");
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    // Only clear the form when the post was actually saved.
    if (!(await createPost(formData))) return;
    setFormData({
      description: "",
      bloodGroup: "",
      quantity: "",
      location: null,
      urgency: "",
    });
    setStep(0);
    setError("");
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Need blood? Post a request</h2>
        <p className="text-sm text-base-content/70">Donors nearby with a matching blood group are notified instantly.</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-base-300 rounded-full h-2" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}>
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm font-medium">Step {step + 1} of {steps.length}: {steps[step]}</p>

      {/* Step Content */}
      <div>
        {step === 0 && (
          <textarea
            className="textarea textarea-bordered w-full"
            rows="4"
            maxLength={1000}
            placeholder="Describe your situation..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        )}

        {step === 1 && (
          <select
            className="select select-bordered w-full"
            value={formData.bloodGroup}
            onChange={(e) => updateField("bloodGroup", e.target.value)}
          >
            <option value="">
              Select Blood Group
            </option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        )}

        {step === 2 && (
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Number of bags required (1-10)"
            min={1}
            max={10}
            value={formData.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
          />
        )}

        {step === 3 && (
          <MapComponent
            onLocationSelect={(lat, lng) =>
              updateField("location", { latitude: lat, longitude: lng })
            }
          />
        )}

        {step === 4 && (
          <select
            className="select select-bordered w-full"
            value={formData.urgency}
            onChange={(e) => updateField("urgency", e.target.value)}
          >
            <option value="">
              Select Urgency
            </option>
            {urgencyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-error text-sm" role="alert">{error}</p>}

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="btn btn-ghost"
        >
          Previous
        </button>

        {step === steps.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? "Posting…" : "Post request"}
          </button>
        ) : (
          <button onClick={nextStep} className="btn btn-primary">
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
