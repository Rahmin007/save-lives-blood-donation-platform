import { useEffect, useState } from "react";
import { useBankStore } from "../stores/useBankStore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const dhakaPosition = [23.8103, 90.4125];

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// BankMapCard.jsx
const BankMapCard = ({ onBankSelect }) => {
  const { bankData, fetchBankData } = useBankStore();

  useEffect(() => {
    fetchBankData();
  }, []);

  const getInventoryList = (inventory) => {
    if (!inventory || typeof inventory !== "object")
      return <p>No inventory data</p>;

    return Object.entries(inventory).map(([group, quantity]) => (
      <p key={group}>
        <span className="font-semibold">
          {group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
        </span>{" "}
        {quantity}
      </p>
    ));
  };

  return (
    <div className="p-4 bg-base-200 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Blood Bank Locations</h2>
      <MapContainer
        center={dhakaPosition}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {bankData.map((bank) => (
          <Marker
            key={bank._id}
            position={[bank.location.latitude, bank.location.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onBankSelect(bank),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{bank.name}</h3>
                <p className="text-sm text-gray-500">
                  Lat: {bank.location.latitude}, Lng: {bank.location.longitude}
                </p>
                {getInventoryList(bank.bloodInventory)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BankMapCard;
