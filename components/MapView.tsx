"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Prospect } from "@/lib/types";

interface MapViewProps {
  centerLat: number;
  centerLng: number;
  radiusMi: number;
  prospects: Prospect[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

const MILES_TO_M = 1609.344;

function makePinIcon(score: number, selected: boolean): L.DivIcon {
  const tier = score >= 70 ? "high" : score >= 50 ? "mid" : "low";
  const bg = tier === "high" ? "#1F4E5F" : tier === "mid" ? "#3A4047" : "#9A958B";
  const ring = selected ? "0 0 0 3px #101418, 0 2px 6px rgba(0,0,0,.3)" : "0 1px 3px rgba(0,0,0,.25)";
  const size = selected ? 32 : 26;
  return L.divIcon({
    className: "tre-pin",
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${bg};
      color:#fff;
      display:flex;align-items:center;justify-content:center;
      font:600 ${size >= 30 ? 12 : 11}px Inter, system-ui;
      box-shadow:${ring};
      border:2px solid #fff;
    ">${score}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeAnchorIcon(): L.DivIcon {
  return L.divIcon({
    className: "tre-anchor",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:#101418;border:3px solid #fff;
      box-shadow:0 0 0 2px #101418, 0 2px 4px rgba(0,0,0,.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MapViewport({ centerLat, centerLng, radiusMi }: { centerLat: number; centerLng: number; radiusMi: number }) {
  const map = useMap();
  useEffect(() => {
    const radiusM = radiusMi * MILES_TO_M;
    const bounds = L.latLng(centerLat, centerLng).toBounds(radiusM * 2);
    map.fitBounds(bounds, { padding: [20, 20], animate: false });
  }, [map, centerLat, centerLng, radiusMi]);
  return null;
}

export function MapView({
  centerLat,
  centerLng,
  radiusMi,
  prospects,
  selectedId,
  onSelect,
  className,
}: MapViewProps) {
  const radiusM = useMemo(() => radiusMi * MILES_TO_M, [radiusMi]);
  const anchorIcon = useMemo(() => makeAnchorIcon(), []);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!selectedId) return;
    const m = markerRefs.current.get(selectedId);
    if (m) m.openPopup();
  }, [selectedId]);

  const placeable = useMemo(
    () => prospects.filter((p) => p.lat !== undefined && p.lng !== undefined),
    [prospects]
  );

  return (
    <div className={`relative ${className ?? "h-full w-full"}`}>
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={12}
      scrollWheelZoom
      attributionControl={false}
      className="h-full w-full"
      style={{ background: "#E8E2D6" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport centerLat={centerLat} centerLng={centerLng} radiusMi={radiusMi} />
      <Circle
        center={[centerLat, centerLng]}
        radius={radiusM}
        pathOptions={{
          color: "#1F4E5F",
          weight: 1.2,
          dashArray: "4 4",
          fillColor: "#1F4E5F",
          fillOpacity: 0.06,
        }}
      />
      <Marker position={[centerLat, centerLng]} icon={anchorIcon} />
      {placeable.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat!, p.lng!]}
          icon={makePinIcon(p.score, selectedId === p.id)}
          eventHandlers={{
            click: () => onSelect?.(p.id),
          }}
        />
      ))}
    </MapContainer>
    <a
      href="https://www.openstreetmap.org/copyright"
      target="_blank"
      rel="noreferrer"
      className="
        absolute bottom-1 right-1 z-[400]
        text-[9px] text-mute hover:text-ink
        bg-bg/70 backdrop-blur-sm rounded px-1.5 py-0.5
        font-medium tracking-tight2
      "
      aria-label="Map data © OpenStreetMap contributors"
    >
      © OSM
    </a>
    </div>
  );
}

export default MapView;
