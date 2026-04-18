
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface TrackingMapProps {
    center: [number, number];
    zoom?: number;
    deliveryAgentLocation: { lat: number, lng: number } | null;
}

const TrackingMap = ({ center, zoom = 13, deliveryAgentLocation }: TrackingMapProps) => {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {deliveryAgentLocation && (
                <Marker position={[deliveryAgentLocation.lat, deliveryAgentLocation.lng]}>
                    <Popup>
                        Delivery Agent
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default TrackingMap;
