"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { UB_CENTER } from "@/lib/geo";
import type { MapListing } from "./types";

function bagIcon(selected: boolean) {
  const size = selected ? 36 : 28;
  return L.divIcon({
    className: "xale-bag-marker",
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:9999px;
      background:${selected ? "#0B3D2E" : "#1F5C45"};
      border:2.5px solid #F7F4EF;
      box-shadow:0 2px 10px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:${selected ? 15 : 12}px;font-weight:800;
      line-height:1;
      transform:translate(-50%,-50%);
    ">●</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({
  points,
  user,
}: {
  points: { lat: number; lng: number }[];
  user: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    const all = [...points];
    if (user) all.push(user);
    if (all.length === 0) {
      map.setView([UB_CENTER.lat, UB_CENTER.lng], 12);
      return;
    }
    if (all.length === 1) {
      map.setView([all[0].lat, all[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(
      all.map((p) => [p.lat, p.lng] as [number, number])
    );
    map.fitBounds(bounds.pad(0.22));
  }, [map, points, user]);
  return null;
}

type Props = {
  listings: MapListing[];
  userPos: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function BagMap({ listings, userPos, selectedId, onSelect }: Props) {
  const points = useMemo(
    () => listings.map((l) => ({ lat: l.lat, lng: l.lng })),
    [listings]
  );

  return (
    <MapContainer
      center={[UB_CENTER.lat, UB_CENTER.lng]}
      zoom={12}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      <FitBounds points={points} user={userPos} />
      {userPos && (
        <CircleMarker
          center={[userPos.lat, userPos.lng]}
          radius={9}
          pathOptions={{
            color: "#fff",
            weight: 3,
            fillColor: "#2563eb",
            fillOpacity: 1,
          }}
        />
      )}
      {listings.map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={bagIcon(selectedId === l.id)}
          eventHandlers={{ click: () => onSelect(l.id) }}
        />
      ))}
    </MapContainer>
  );
}
