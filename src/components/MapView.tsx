import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ad } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  ads: Ad[];
  onAdClick: (ad: Ad) => void;
  center?: [number, number];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ ads, onAdClick, center = [-23.5505, -46.6333] }) => {
  return (
    <div className="h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-inner">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && <ChangeView center={center as [number, number]} />}
        {ads.map((ad) => (
          <Marker
            key={ad.id}
            position={[ad.location.lat, ad.location.lng] as [number, number]}
            eventHandlers={{
              click: () => onAdClick(ad),
            }}
          >
            <Popup>
              <div className="p-1">
                <img 
                  src={ad.imageUrl || `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=200&h=150&auto=format&fit=crop`} 
                  alt={ad.title} 
                  className="w-full h-24 object-cover rounded-lg mb-2"
                  referrerPolicy="no-referrer"
                />
                <h4 className="font-bold text-sm mb-1">{ad.title}</h4>
                <p className="text-emerald-600 font-bold text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
