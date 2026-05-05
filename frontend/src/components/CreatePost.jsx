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
  const { createPost, loadingPosts } = usePostStore();

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
      case 2:
        const quantity = Number(formData.quantity);
        if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 10) {
          setError("Enter a quantity between 1 and 10.");
          return false;
        }
        break;

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
    console.log("Submitting post:", formData);
    await createPost(formData);
    // Optionally reset the form or redirect
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
    <div className="w-full mx-auto mt-8 p-6 border rounded shadow bg-base-100 space-y-4">
      <h2 className=" text-xl font-bold text-center">Create a New Post</h2>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-success h-3 rounded-full"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-center font-medium">{steps[step]}</p>

      {/* Step Content */}
      <div>
        {step === 0 && (
          <textarea
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Describe your situation..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        )}

        {step === 1 && (
          <select
            className="w-full p-2 border rounded"
            value={formData.bloodGroup}
            onChange={(e) => updateField("bloodGroup", e.target.value)}
          >
            <option value="" className="text-black">
              Select Blood Group
            </option>
            {bloodGroups.map((group) => (
              <option key={group} value={group} className="text-black">
                {group}
              </option>
            ))}
          </select>
        )}

        {step === 2 && (
          <input
            type="number"
            className="w-full p-2 border rounded"
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
            className="w-full p-2 border rounded"
            value={formData.urgency}
            onChange={(e) => updateField("urgency", e.target.value)}
          >
            <option value="" className="text-black">
              Select Urgency
            </option>
            {urgencyLevels.map((level) => (
              <option key={level} value={level} className="text-black">
                {level}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="px-4 py-2 btn btn-neutral"
        >
          Previous
        </button>

        {step === steps.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={loadingPosts}
            className="btn btn-neutral"
          >
            {loadingPosts ? "Submitting..." : "Submit"}
          </button>
        ) : (
          <button onClick={nextStep} className="btn btn-neutral">
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
