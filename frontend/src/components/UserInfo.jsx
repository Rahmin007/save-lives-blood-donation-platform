import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import MapComponent from "./MapComponent";
import Loading from "./Loading";

const UserInfo = () => {
  const { user, updateUser, loading } = useAuthStore();

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
        latitude: user.user.latitude || null,
        longitude: user.user.longitude || null,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <>
        <Loading />
      </>
    );
  }

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
    try {
      const res = await updateUser(formData);
      setMessage("Profile updated successfully!");
      // Optionally, you could update the form data with the new user info returned.
      window.location.reload();
    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="bg-secondary p-6 rounded-lg shadow-lg w-full max-w-2xl">
        {message && (
          <p className="text-center mb-4 text-green-500">{message}</p>
        )}

        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="text-black border-2 rounded-lg p-2 shadow-sm"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              className="text-black border-2 rounded-lg p-2 shadow-sm"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="New Password (leave blank to keep unchanged)"
              className="text-black border-2 rounded-lg p-2 shadow-sm"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <select
              name="bloodGroup"
              className="text-black border-2 rounded-lg p-2 shadow-sm"
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

            <div className="flex items-center border-2 rounded-lg p-2 shadow-sm border-black">
              <span className="text pr-2">+880</span>
              <input
                type="text"
                placeholder="1XXXXXXXXX"
                className="text-black flex-1 shadow-sm"
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
              className="text-black border-2 rounded-lg p-2 shadow-sm"
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
              className="text-black border-2 rounded-lg p-2 shadow-sm"
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
              className="text-black border-2 rounded-lg p-2 shadow-sm"
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
              className="text-black border-2 rounded-lg p-2 shadow-sm"
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
          <div className="col-span-2 mt-6">
            <h3
              className="text-lg font-semibold mb-2 cursor-pointer text hover:underline"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "Hide Map" : "Select Your Location"}
            </h3>
            {showMap && (
              <div className="mt-4">
                <MapComponent onLocationSelect={handleLocationSelect} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-2 flex justify-center mt-6">
            <button type="submit" className="btn w-full btn-primary">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfo;
