import React, { useState } from "react";
import MapComponent from "../components/MapComponent";
import { Link, useNavigate } from "react-router-dom";
import { Droplet } from "lucide-react";
import { homePath } from "../lib/routes";
import { errorMessage } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();

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
    latitude: 23.8103,
    longitude: 90.4125,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const genderConfig = {
    male: { height: { min: 150, max: 200 }, weight: { min: 50, max: 120 } },
    female: { height: { min: 140, max: 180 }, weight: { min: 40, max: 100 } },
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["age", "weight", "height", "mobile"].includes(name)
        ? Number(value) || ""
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
    setMessage("");
    setLoading(true);
    try {
      const res = await signup(formData);
      navigate(homePath({ user: res.data.user }), { replace: true }); // already logged in
    } catch (error) {
      setMessage(errorMessage(error, "Sign-up failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 ">
      <div className="card bg-base-100 p-6 sm:p-8 shadow-xl w-full max-w-2xl">
        <div className="flex items-center gap-2 text-primary font-bold text-xl mb-1">
          <Droplet className="fill-primary" size={24} aria-hidden="true" /> Save Lives
        </div>
        <h1 className="text-2xl font-bold">Create your donor account</h1>
        <p className="text-base-content/70 mb-5">Your blood group and location help people nearby find you when they need blood.</p>
        {message && <div role="alert" className="alert alert-error text-sm py-2 mb-4">{message}</div>}

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="Password"
              className="input input-bordered w-full"
              required
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
                  setFormData({ ...formData, mobile: value ? Number(value) : "" });
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <select
              name="gender"
              className="select select-bordered w-full"
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
          <div className="mt-2 sm:col-span-2">
            <h3
              className="text-base font-semibold mb-2 cursor-pointer text-primary hover:underline"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "Hide Map" : "📍 Select Your Location (optional)"}
            </h3>
            {showMap && (
              <div className="mt-4">
                <MapComponent onLocationSelect={handleLocationSelect} />
              </div>
            )}
            {formData.latitude && (
              <p className="text-xs text-success mt-1">
                ✓ Location set: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col items-center mt-2">
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            <p className="mt-2 text-sm">
              Already have an account?{" "}
              <Link to="/" className="link link-primary font-medium">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
