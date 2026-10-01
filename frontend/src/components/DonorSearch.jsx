import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Search } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { errorMessage } from "../lib/api";
import MapComponent from "./MapComponent";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DISTANCES = [1, 3, 5, 10, 25];

const DonorSearch = () => {
  const { searchForDonor } = useAuthStore();
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState("");
  const [coords, setCoords] = useState(null);
  const [km, setKm] = useState(5);
  const [showMap, setShowMap] = useState(false);
  const [donors, setDonors] = useState(null); // null = not searched yet
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!bloodGroup) return setError("Please choose a blood group.");
    setError("");
    setSearching(true);
    try {
      const filters = { bloodgroup: bloodGroup, ...(coords && { latitude: coords.lat, longitude: coords.lng, maxDistance: km * 1000 }) };
      setDonors((await searchForDonor(filters)).donors);
    } catch (err) {
      setError(errorMessage(err, "Search failed."));
    } finally {
      setSearching(false);
    }
  };

  const openChat = (donor) =>
    navigate("/messagepage", {
      state: { selectedUser: donor, draft: `Hi ${donor.name}, I found you through donor search. Could you donate ${donor.bloodGroup} blood?` },
    });

  return (
    <div className="card bg-base-100 border border-base-300 p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Find a donor</h2>
        <p className="text-sm text-base-content/70">Search registered donors by blood group, nearest first.</p>
      </div>
      <form onSubmit={search} className="space-y-3">
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="select select-bordered w-full" aria-label="Blood group">
          <option value="">Blood group…</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <button type="button" className="link link-primary text-sm" onClick={() => setShowMap((v) => !v)}>
          {showMap ? "Hide map" : coords ? "📍 Change search location" : "📍 Search near a location"}
        </button>
        {showMap && <MapComponent height={220} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />}

        {coords && (
          <label className="form-control">
            <span className="label-text mb-1">Within</span>
            <select value={km} onChange={(e) => setKm(Number(e.target.value))} className="select select-bordered select-sm">
              {DISTANCES.map((d) => <option key={d} value={d}>{d} km</option>)}
            </select>
          </label>
        )}

        {error && <p className="text-error text-sm" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={searching}>
          <Search size={16} aria-hidden="true" /> {searching ? "Searching…" : "Search donors"}
        </button>
      </form>

      {donors && (
        <div className="space-y-2" aria-live="polite">
          <p className="text-sm font-medium">{donors.length ? `${donors.length} donor${donors.length > 1 ? "s" : ""} found` : "No donors found. Try a larger distance."}</p>
          {donors.map((donor) => (
            <div key={donor._id} className="border border-base-300 rounded-lg p-3 flex items-center gap-3">
              <span className="badge badge-primary">{donor.bloodGroup}</span>
              <p className="font-medium flex-1 truncate">{donor.name}</p>
              <a href={`tel:+880${donor.mobile}`} className="btn btn-ghost btn-sm btn-square" aria-label={`Call ${donor.name}`}>
                <Phone size={16} />
              </a>
              <button onClick={() => openChat(donor)} className="btn btn-primary btn-sm btn-square" aria-label={`Message ${donor.name}`}>
                <MessageCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorSearch;
