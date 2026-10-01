import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

/** Map pin bundled with the app (no dependency on an external CDN). */
export const markerIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const DHAKA = [23.8103, 90.4125];

/** Blood group label → field name in a bank's bloodInventory. */
export const GROUP_KEYS = [
  ["A+", "A_positive"], ["A-", "A_negative"], ["B+", "B_positive"], ["B-", "B_negative"],
  ["AB+", "AB_positive"], ["AB-", "AB_negative"], ["O+", "O_positive"], ["O-", "O_negative"],
];
export const INVENTORY_KEY = Object.fromEntries(GROUP_KEYS);
