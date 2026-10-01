import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Droplet, MapPin, MessageCircle, Bell } from "lucide-react";
import { useAuthStore, errorMessage } from "../stores/useAuthStore";
import { homePath } from "../lib/routes";

const FEATURES = [
  { icon: <MapPin size={18} aria-hidden="true" />, text: "Find donors near you by blood group" },
  { icon: <Bell size={18} aria-hidden="true" />, text: "Nearby donors are notified when you post a request" },
  { icon: <MessageCircle size={18} aria-hidden="true" />, text: "Chat with donors in real time" },
];

/** Landing + login page: explains the app on the left, form on the right. */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(formData);
      navigate(location.state?.from || homePath({ user: res.data.user }), { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Login failed."));
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="bg-primary text-primary-content flex flex-col justify-center gap-8 p-8 sm:p-14">
        <div className="flex items-center gap-3 text-3xl font-bold">
          <Droplet className="fill-current" size={40} aria-hidden="true" />
          Save Lives
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Every drop counts.</h1>
          <p className="mt-3 text-lg opacity-90 max-w-md">
            Connect blood donors with people who need blood, quickly and close to home.
          </p>
        </div>
        <ul className="space-y-3">
          {FEATURES.map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-white/15">
                {icon}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12 bg-base-200">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <form className="card-body gap-4" onSubmit={handleSubmit} noValidate>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-base-content/70 -mt-2">Log in to continue.</p>

            {error && <div role="alert" className="alert alert-error text-sm py-2">{error}</div>}

            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Email</span>
              <input type="email" name="email" className="input input-bordered w-full" value={formData.email}
                onChange={handleChange} autoComplete="email" required />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Password</span>
              <input type="password" name="password" className="input input-bordered w-full" value={formData.password}
                onChange={handleChange} autoComplete="current-password" required />
            </label>

            <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Log in"}
            </button>
            <p className="text-center text-sm">
              New here?{" "}
              <Link to="/signup" className="link link-primary font-medium">Create an account</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
