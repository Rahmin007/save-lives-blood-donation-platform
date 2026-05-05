import { useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

const dhakaPosition = [23.8103, 90.4125];

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const LocationSelector = ({ setSelectedPosition }) => {
  useMapEvents({
    click(e) {
      setSelectedPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapComponent = ({ onLocationSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleSelectLocation = (lat, lng) => {
    setSelectedPosition([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng); // Only call if it's defined
    }
  };

  return (
    <MapContainer
      center={dhakaPosition}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationSelector
        setSelectedPosition={(pos) => handleSelectLocation(pos[0], pos[1])}
      />
      {selectedPosition && (
        <Marker position={selectedPosition} icon={customIcon}>
          <Popup>
            Lat: {selectedPosition[0]}, Lng: {selectedPosition[1]}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
