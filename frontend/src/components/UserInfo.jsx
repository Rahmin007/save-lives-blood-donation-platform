import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import MapComponent from "./MapComponent";
import toast from "react-hot-toast";
import { errorMessage } from "../lib/api";

const UserInfo = () => {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bloodGroup: "",
    mobile: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    latitude: null,
    longitude: null,
  });

  const [message, setMessage] = useState("");

  const [showMap, setShowMap] = useState(false);

  const genderConfig = {
    male: { height: { min: 150, max: 200 }, weight: { min: 50, max: 120 } },
    female: { height: { min: 140, max: 180 }, weight: { min: 40, max: 100 } },
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user.name || "",
        email: user.user.email || "",
        password: "",
        bloodGroup: user.user.bloodGroup || "",
        mobile: user.user.mobile || "",
        gender: user.user.gender || "",
        age: user.user.age || "",
        height: user.user.height || "",
        weight: user.user.weight || "",
        latitude: null, // only sent when a new location is picked on the map
        longitude: null,
      });
    }
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["age", "weight", "height", "mobile"].includes(name)
        ? value
          ? Number(value)
          : ""
        : value,
    });
  };
  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(formData);
      setMessage("");
      setFormData((prev) => ({ ...prev, password: "" }));
      toast.success("Profile updated.");
    } catch (error) {
      setMessage(errorMessage(error, "Update failed."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center p-2 sm:p-4">
      <div className="bg-base-100 p-4 sm:p-6 rounded-box w-full max-w-2xl">
        {message && (
          <div role="alert" className="alert alert-error text-sm py-2 mb-4">{message}</div>
        )}

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="New Password (leave blank to keep unchanged)"
              className="input input-bordered w-full"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <select
              name="bloodGroup"
              className="input input-bordered w-full"
              required
              value={formData.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>

            <div className="flex items-center input input-bordered w-full">
              <span className="pr-2 text-base-content/60">+880</span>
              <input
                type="text"
                placeholder="1XXXXXXXXX"
                className="flex-1 outline-none bg-transparent"
                required
                name="mobile"
                value={formData.mobile}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 10) value = value.slice(0, 10);
                  setFormData({ ...formData, mobile: value });
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <select
              name="gender"
              className="input input-bordered w-full"
              required
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <input
              type="number"
              placeholder="Age"
              className="input input-bordered w-full"
              required
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="65"
              disabled={!formData.gender}
            />

            <input
              type="number"
              placeholder="Height (cm)"
              className="input input-bordered w-full"
              required
              name="height"
              value={formData.height}
              onChange={handleChange}
              min={
                formData.gender ? genderConfig[formData.gender].height.min : 0
              }
              max={
                formData.gender ? genderConfig[formData.gender].height.max : 999
              }
              disabled={!formData.gender}
            />

            <input
              type="number"
              placeholder="Weight (kg)"
              className="input input-bordered w-full"
              required
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min={
                formData.gender ? genderConfig[formData.gender].weight.min : 0
              }
              max={
                formData.gender ? genderConfig[formData.gender].weight.max : 999
              }
              disabled={!formData.gender}
            />
          </div>

          {/* Map Section */}
          <div className="sm:col-span-2 mt-6">
            <h3
              className="text-base font-semibold mb-2 cursor-pointer text-primary hover:underline"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "Hide map" : "📍 Change my location"}
            </h3>
            {showMap && (
              <div className="mt-4">
                <MapComponent onLocationSelect={handleLocationSelect} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 flex justify-center mt-6">
            <button type="submit" className="btn w-full btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfo;
