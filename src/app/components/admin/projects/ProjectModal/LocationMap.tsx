"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

type Props = {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
};

const defaultCenter: [number, number] = [54.6872, 25.2797]; // Vilnius

// Fix default marker icon (Next + bundling)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function ProjectLocationMap({ lat, lng, onPick }: Props) {
  
  const center = useMemo<[number, number]>(() => {
    if (lat != null && lng != null) return [lat, lng];
    return defaultCenter;
  }, [lat, lng]);

  return (
    
    <div className="rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={lat != null && lng != null ? 14 : 11}
        style={{ height: 320, width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPick={onPick} />

        {lat != null && lng != null ? (
          <Marker position={[lat, lng]} icon={markerIcon} />
        ) : null}
      </MapContainer>
    </div>
  );
}
