import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import toast from "react-hot-toast";
import { DHAKA, markerIcon } from "../lib/map";

const ClickToSelect = ({ onSelect }) => {
  useMapEvents({ click: (e) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
};

/** Moves the map when the selected position changes (e.g. after "Use my location"). */
const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [position, map]);
  return null;
};

/** Pick a location by clicking the map or using the device's GPS. */
const MapComponent = ({ onLocationSelect, initialPosition = null, height = 320 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [locating, setLocating] = useState(false);

  const select = (lat, lng) => {
    setPosition([lat, lng]);
    onLocationSelect?.(lat, lng);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Your browser can't share its location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        select(coords.latitude, coords.longitude);
        setLocating(false);
      },
      () => {
        toast.error("Couldn't get your location. Tap the map instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-base-content/70">Tap the map to set the location, or</p>
        <button type="button" onClick={useMyLocation} className="btn btn-outline btn-sm" disabled={locating}>
          <LocateFixed size={16} aria-hidden="true" /> {locating ? "Locating…" : "Use my location"}
        </button>
      </div>
      <MapContainer center={position ?? DHAKA} zoom={13} style={{ height, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickToSelect onSelect={select} />
        <FlyTo position={position} />
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
      {position && (
        <p className="text-xs text-success">
          ✓ Location set ({position[0].toFixed(4)}, {position[1].toFixed(4)})
        </p>
      )}
    </div>
  );
};

export default MapComponent;
