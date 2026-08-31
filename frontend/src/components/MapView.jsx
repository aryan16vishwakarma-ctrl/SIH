import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, User, Sprout } from 'lucide-react';

// Custom Leaflet Pin Icon
const createCustomIcon = (isSelected, category) => {
  const color = isSelected ? '#10b981' : '#3b82f6';
  const html = `
    <div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px ${isSelected ? 'rgba(16,185,129,0.6)' : 'rgba(0,0,0,0.4)'};
      border: 2px solid #ffffff;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: transform 0.2s ease;
    ">
      <span style="font-size: 18px;">🌱</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

function MapFlyToController({ selectedProduct }) {
  const map = useMap();

  useEffect(() => {
    if (selectedProduct && selectedProduct.farmer) {
      const { latitude, longitude } = selectedProduct.farmer;
      if (latitude && longitude) {
        map.flyTo([latitude, longitude], 10, { duration: 1.5 });
      }
    }
  }, [selectedProduct, map]);

  return null;
}

const MapView = ({ products = [], selectedProduct = null, onSelectProduct }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const initialZoom = 5;

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden glass-panel border border-slate-800 relative">
      <MapContainer
        center={defaultCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyToController selectedProduct={selectedProduct} />

        {products.map((product) => {
          const farmer = product.farmer || {};
          if (!farmer.latitude || !farmer.longitude) return null;

          const isSelected = selectedProduct && selectedProduct.id === product.id;

          return (
            <Marker
              key={product.id}
              position={[farmer.latitude, farmer.longitude]}
              icon={createCustomIcon(isSelected, product.category)}
              eventHandlers={{
                click: () => onSelectProduct && onSelectProduct(product),
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs">
                  <div className="flex items-center space-x-1 text-emerald-400 font-bold text-sm mb-1">
                    <Sprout className="w-4 h-4" />
                    <span>{product.crop_name}</span>
                  </div>
                  <p className="text-lg font-black text-white">
                    ₹{product.price_per_kg} / kg
                  </p>
                  <p className="text-xs text-slate-300 mt-1 flex items-center">
                    <User className="w-3 h-3 mr-1 text-slate-400" />
                    {farmer.name} ({farmer.district}, {farmer.state})
                  </p>
                  {farmer.phone && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" />
                      {farmer.phone}
                    </p>
                  )}
                  <button
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                    className="mt-3 w-full text-center py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Select Product
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
