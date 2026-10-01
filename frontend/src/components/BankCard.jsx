import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useBankStore } from "../stores/useBankStore";
import { DHAKA, GROUP_KEYS, markerIcon } from "../lib/map";

/** Map of blood banks. `onBankSelect` is optional (the admin map is view-only). */
const BankMapCard = ({ onBankSelect, height = 420 }) => {
  const { bankData, fetchBankData } = useBankStore();

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  return (
    <div className="card bg-base-100 border border-base-300 p-4">
      <h2 className="text-lg font-bold mb-1">Blood bank locations</h2>
      <p className="text-sm text-base-content/70 mb-3">
        {onBankSelect ? "Tap a bank on the map to choose it." : "Tap a bank to see its stock."}
      </p>
      <MapContainer center={DHAKA} zoom={12} style={{ height, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {bankData.map((bank) => (
          <Marker
            key={bank._id}
            position={[bank.location.latitude, bank.location.longitude]}
            icon={markerIcon}
            eventHandlers={{ click: () => onBankSelect?.(bank) }}
          >
            <Popup>
              <p className="font-bold mb-1">{bank.name}</p>
              <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-sm">
                {GROUP_KEYS.map(([label, key]) => (
                  <span key={key}><b>{label}</b> {bank.bloodInventory?.[key] ?? 0}</span>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BankMapCard;
