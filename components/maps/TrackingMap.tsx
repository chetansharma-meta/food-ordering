"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ─── Fix Leaflet default icons ─────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// ─── Inject keyframes once ─────────────────────────────────────────────────
if (typeof window !== "undefined") {
  const id = "fo-map-styles";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes fo-pulse {
        0%   { transform: scale(1);   opacity: 0.6; }
        100% { transform: scale(3.8); opacity: 0;   }
      }
      @keyframes fo-blink {
        0%, 100% { opacity: 1;   }
        50%      { opacity: 0.2; }
      }
    `;
    document.head.appendChild(s);
  }
}

// ─── Enable touch zoom (pinch) handler ────────────────────────────────────
// Leaflet disables touch zoom on scroll by default — this re-enables it
function EnableTouchZoom() {
  const map = useMap();
  useEffect(() => {
    // Enable pinch-to-zoom on touch devices
    map.touchZoom.enable();
    // Also allow two-finger scroll zoom (important for mobile)
    if ((map as any).scrollWheelZoom) {
      // Keep scroll wheel off on desktop (UX), but touch pinch always on
    }
  }, [map]);
  return null;
}

// ─── Icons ─────────────────────────────────────────────────────────────────

/**
 * Home icon with pulse ring — delivery destination (user's location)
 * Matches the app's blue color, clearly communicates "your address"
 */
const homeLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:28px;height:28px;">
      <!-- pulse ring -->
      <div style="
        position:absolute;inset:-4px;border-radius:50%;
        background:rgba(59,130,246,0.18);
        animation:fo-pulse 2.2s ease-out infinite;
      "></div>
      <!-- home icon container -->
      <div style="
        position:absolute;inset:0;
        width:28px;height:28px;border-radius:50%;
        background:#3B82F6;
        border:2.5px solid #fff;
        box-shadow:0 2px 10px rgba(59,130,246,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    </div>`,
  iconSize:    [28, 28],
  iconAnchor:  [14, 14],
  popupAnchor: [0, -18],
});

/** Blue scooter circle — delivery partner */
const agentIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:38px;height:38px;border-radius:50%;
      background:#2563EB;border:3px solid #fff;
      box-shadow:0 3px 12px rgba(37,99,235,0.38);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
           stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="5.5" cy="17.5" r="2.5"/>
        <circle cx="17.5" cy="17.5" r="2.5"/>
        <path d="M5.5 17.5V9l3-5h6l3 5v8.5"/>
        <path d="M8 17.5h7"/>
        <path d="M9 4l-1 5h8l-1-5"/>
      </svg>
    </div>`,
  iconSize:    [38, 38],
  iconAnchor:  [19, 19],
  popupAnchor: [0, -22],
});

// ─── Auto-fit bounds ───────────────────────────────────────────────────────
function MapAutoFit({ positions }: { positions: ([number, number] | null)[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = positions.filter(Boolean) as [number, number][];
    if (valid.length < 2) return;
    map.fitBounds(
      L.latLngBounds(valid.map((p) => L.latLng(p[0], p[1]))),
      { padding: [50, 50], maxZoom: 16 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.map((p) => p?.join(",")).join("|")]);
  return null;
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface TrackingMapProps {
  center:                [number, number];
  zoom?:                 number;
  deliveryAgentLocation: { lat: number; lng: number } | null;
  agentName?:            string;
  agentRating?:          number;
  agentPhone?:           string;
  agentAvatarUrl?:       string;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function TrackingMap({
  center,
  zoom               = 15,
  deliveryAgentLocation,
  agentName          = "Ravi Kumar",
  agentRating        = 4.8,
  agentPhone         = "+91 98765 43210",
  agentAvatarUrl,
}: TrackingMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showPhone, setShowPhone]       = useState(false);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  const mapCenter = userLocation || center;
  const agentPos  = deliveryAgentLocation
    ? ([deliveryAgentLocation.lat, deliveryAgentLocation.lng] as [number, number])
    : null;

  return (
    <div style={{ fontFamily: "inherit" }}>

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: 260,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}>
        <MapContainer
          key={`${mapCenter[0]}-${mapCenter[1]}`}
          center={mapCenter}
          zoom={zoom}
          // ★ Pinch zoom: scrollWheelZoom off on desktop, touch always on
          scrollWheelZoom={false}
          // These two enable pinch-to-zoom on mobile
          touchZoom={true}
          doubleClickZoom={true}
          zoomControl={false}
          attributionControl={true}
          style={{ height: "100%", width: "100%", touchAction: "pan-x pan-y" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Ensure touch zoom handler is active */}
          <EnableTouchZoom />

          <MapAutoFit positions={[agentPos, userLocation]} />

          {/* Delivery agent */}
          {agentPos && (
            <Marker position={agentPos} icon={agentIcon}>
              <Popup>
                <span style={{ fontWeight: 600 }}>{agentName}</span><br />
                Delivery Partner
              </Popup>
            </Marker>
          )}

          {/* ★ User location — home icon with pulse */}
          {userLocation && (
            <Marker position={userLocation} icon={homeLocationIcon}>
              <Popup>
                <span style={{ fontWeight: 600 }}>Your delivery location</span>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Live badge */}
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 1000,
          background: "#fff", border: "1px solid #E5E7EB",
          borderRadius: 20, padding: "4px 10px",
          display: "flex", alignItems: "center", gap: 5,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          fontSize: 12, fontWeight: 600, color: "#374151",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#22C55E",
            animation: "fo-blink 1.4s ease-in-out infinite",
          }} />
          Live
        </div>

        {/* Pinch hint — shown briefly on mobile, fades after 3s via CSS */}
        <div style={{
          position: "absolute", bottom: 28, right: 10, zIndex: 1000,
          background: "rgba(0,0,0,0.45)",
          borderRadius: 8, padding: "4px 9px",
          fontSize: 10, color: "#fff", fontWeight: 500,
          pointerEvents: "none",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
               stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
          Pinch to zoom
        </div>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 28, left: 10, zIndex: 1000,
          background: "rgba(255,255,255,0.93)",
          border: "1px solid #E5E7EB", borderRadius: 8,
          padding: "6px 10px",
          display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {/* Home dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#374151" }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "#3B82F6", border: "2px solid #fff",
              boxShadow: "0 0 0 2px rgba(59,130,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none"
                   stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            You
          </div>
          {/* Partner dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#374151" }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#2563EB", flexShrink: 0,
            }} />
            Partner
          </div>
        </div>
      </div>

      {/* ── Agent row ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        paddingTop: 14,
      }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {agentAvatarUrl ? (
            <img src={agentAvatarUrl} alt={agentName} style={{
              width: 44, height: 44, borderRadius: "50%",
              objectFit: "cover", border: "2px solid #E5E7EB",
            }} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#3B82F6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, color: "#fff", fontWeight: 700,
            }}>
              {agentName.charAt(0)}
            </div>
          )}
          <div style={{
            position: "absolute", bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: "50%",
            background: "#22C55E", border: "2px solid #fff",
          }} />
        </div>

        {/* Name + rating */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {agentName}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <span style={{ color: "#F59E0B", fontSize: 13, lineHeight: 1 }}>★</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{agentRating}</span>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>· Delivery Partner</span>
          </div>
        </div>

        {/* Call button only */}
        <button
          onClick={() => setShowPhone((v) => !v)}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            border: "1.5px solid #D1D5DB",
            background: showPhone ? "#EFF6FF" : "#fff",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          title="Call delivery partner"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke={showPhone ? "#2563EB" : "#6B7280"}
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z"/>
          </svg>
        </button>
      </div>

      {/* Phone reveal */}
      {showPhone && (
        <div style={{
          marginTop: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#EFF6FF", border: "1px solid #BFDBFE",
          borderRadius: 8, padding: "10px 14px",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1D4ED8" }}>
            {agentPhone}
          </span>
          <a href={`tel:${agentPhone.replace(/\s/g, "")}`} style={{
            background: "#3B82F6", color: "#fff",
            fontSize: 13, fontWeight: 600,
            padding: "6px 14px", borderRadius: 7,
            textDecoration: "none",
          }}>
            Call Now
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Usage ─────────────────────────────────────────────────────────────────
// <TrackingMap
//   center={[28.6139, 77.2090]}
//   deliveryAgentLocation={{ lat: 28.615, lng: 77.211 }}
//   agentName="Ravi Kumar"
//   agentRating={4.8}
//   agentPhone="+91 98765 43210"
// />