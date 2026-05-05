import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const Login = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData); // store now keeps { user: {...} } shape
      setMessage(response?.data?.message || "");
      setFormData({ email: "", password: "" });
      navigate("/home");
    } catch (error) {
      console.log("login failed", error?.response?.data);
      setMessage(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="card bg-base-300 p-6 rounded-lg shadow-lg">
        {message && <p className="text-center text-red-500">{message}</p>}
        <form className="flex flex-col gap-4 bg-base-300" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="input-primary bg-base-200 rounded-lg p-2 shadow-sm focus:outline-none"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="input-primary bg-base-200 rounded-lg p-2 shadow-sm focus:outline-none"
            required
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <button className="btn text-white font-bold py-2 px-6 rounded-lg shadow-md w-full" type="submit">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Have No Account? Sign Up here!! ➡{" "}
          <Link to="/signup" className="hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
